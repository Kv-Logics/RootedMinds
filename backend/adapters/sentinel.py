"""
adapters/sentinel.py — Benchmark Adapter
==========================================
This is the file the hackathon benchmark harness imports.

The harness calls:
    engine = SentinelEngine()
    engine.ingest(stream_of_events)
    context = engine.reconstruct_context(signal, mode="fast")
    engine.close()

Scoring criteria this adapter is optimized for:
    1. Temporal reasoning        — causal chain from deploy → metric → incident
    2. Topology-independent      — Ghost Protocol handles service renames
    3. Behavioral abstraction    — DNA fingerprinting across 28 dimensions
    4. Evolving associations     — edge decay + reinforcement on remediation
    5. Adaptive reconstruction   — mode="fast" < 2s, mode="deep" uses LLM
    6. Cold-start < 60s          — all services init in-memory, no DB needed
    7. Hot-path < 2s             — cosine search over numpy vectors, sub-1ms

Benchmark adversarial test cases this handles:
    - Service renamed: payment-service → billing-engine
      Ghost Protocol detects via DNA similarity, migrates graph edges
    - Schema-free events: arbitrary dict structure tolerated
    - Sparse history: works with as few as 1 past incident
    - Zero events: returns empty context with confidence 0.0 (no crash)
"""

import sys
import os
import time
from typing import Iterable, Any

# ── Path setup — works whether run from repo root or adapters/ dir ──
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.dirname(_HERE)
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)

from app.services.dna import DNAService
from app.services.graph import CausalGraphEngine
from app.services.ghost import GhostRegistry
from app.services.reconstruct import ReconstructService


class SentinelEngine:
    """
    Persistent Context Engine — benchmark-compatible implementation.

    Lifecycle:
        __init__()              → initialise all in-memory structures
        ingest(events)          → feed the event stream
        reconstruct_context()   → answer the incident query
        close()                 → optional cleanup
    """

    def __init__(self):
        self._start = time.monotonic()

        # Core services — all in-memory, no external dependencies
        self.dna     = DNAService()
        self.graph   = CausalGraphEngine()
        self.ghost   = GhostRegistry(self.dna, self.graph)
        self.engine  = ReconstructService(self.dna, self.graph, self.ghost)

        cold_ms = round((time.monotonic() - self._start) * 1000, 1)
        print(f"[SentinelEngine] Cold start: {cold_ms}ms")

    # ──────────────────────────────────────────────────────────────
    # ingest — feed the event stream
    # ──────────────────────────────────────────────────────────────

    def ingest(self, events: Iterable[Any]) -> None:
        """
        Accepts an iterable of event dicts (or Pydantic-like objects).
        Each event is a dict with at minimum: { "ts": str, "kind": str }

        All event kinds are handled:
            deploy, log, metric, trace, topology, incident_signal, remediation
        """
        t0 = time.monotonic()
        count = 0

        for raw in events:
            # Normalise: accept both dicts and objects with .dict() / model_dump()
            event = self._to_dict(raw)
            kind  = event.get("kind", "")

            # 1. Identify the service
            service_id = (
                event.get("service")
                or event.get("target")
                or self._extract_service_from_spans(event)
            )

            # 2. Update DNA fingerprint
            if service_id:
                self.dna.update(service_id, event)

            # 3. Update causal graph
            self.graph.process_event(event)

            # 4. Ghost Protocol — handle topology renames
            if kind == "topology" and event.get("change") == "rename":
                old = event.get("from") or event.get("from_service")
                new = event.get("to")   or event.get("to_service")
                if old and new:
                    self.ghost.run_ghost_protocol(old, new)

            # 5. Auto-snapshot incident DNA for future matching
            if kind == "incident_signal":
                inc_id = event.get("incident_id", "")
                if inc_id and service_id:
                    self.dna.store_incident(
                        incident_id=inc_id,
                        service_id=service_id,
                        metadata={"trigger": event.get("trigger", ""), "ts": event.get("ts", "")},
                    )

            count += 1

        elapsed = round((time.monotonic() - t0) * 1000, 1)
        print(f"[SentinelEngine] Ingested {count} events in {elapsed}ms")

    # ──────────────────────────────────────────────────────────────
    # reconstruct_context — answer the incident query
    # ──────────────────────────────────────────────────────────────

    def reconstruct_context(self, signal: Any, mode: str = "fast") -> dict:
        """
        Given an incident signal, reconstruct the operational context.

        signal must have: { "ts": str, "incident_id": str, "trigger": str }
        mode: "fast" (template narrative, <2s) | "deep" (LLM, <30s)

        Returns a dict matching the Context schema:
        {
            "related_events":         [...],
            "causal_chain":           [...],
            "similar_past_incidents": [...],
            "suggested_remediations": [...],
            "confidence":             float,
            "explain":                str,
        }
        """
        t0 = time.monotonic()

        signal_dict = self._to_dict(signal)

        # Ensure incident signal is ingested into the DNA store
        inc_id     = signal_dict.get("incident_id", "UNKNOWN")
        service_id = self.dna._extract_service_from_signal(signal_dict)
        if service_id and service_id != "unknown-service":
            self.dna.store_incident(
                incident_id=inc_id,
                service_id=service_id,
                metadata={"trigger": signal_dict.get("trigger", ""), "ts": signal_dict.get("ts", "")},
            )

        context = self.engine.reconstruct(signal_dict, mode=mode)

        elapsed = round((time.monotonic() - t0) * 1000, 1)
        print(f"[SentinelEngine] Reconstructed {inc_id} in {elapsed}ms (mode={mode})")

        return context

    # ──────────────────────────────────────────────────────────────
    # close — cleanup
    # ──────────────────────────────────────────────────────────────

    def close(self) -> None:
        """Optional cleanup. All state is in-memory so nothing to flush."""
        print("[SentinelEngine] Closed")

    # ──────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────

    @staticmethod
    def _to_dict(obj: Any) -> dict:
        """Normalise event/signal to a plain dict."""
        if isinstance(obj, dict):
            return obj
        # Pydantic v2
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        # Pydantic v1
        if hasattr(obj, "dict"):
            return obj.dict()
        # Dataclass
        if hasattr(obj, "__dataclass_fields__"):
            import dataclasses
            return dataclasses.asdict(obj)
        # Last resort
        return vars(obj)

    @staticmethod
    def _extract_service_from_spans(event: dict) -> str:
        """Extract service name from trace spans if present."""
        spans = event.get("spans", [])
        if spans and isinstance(spans, list) and len(spans) > 0:
            return spans[0].get("service", "")
        return ""
