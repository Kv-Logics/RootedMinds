"""
reconstruct.py — Context Reconstruction Engine
===============================================
On incident_signal, this service:
  1. Identifies the affected service from the trigger string
  2. Resolves Ghost Protocol (handles renamed services transparently)
  3. Computes the incident's behavioral DNA vector
  4. Searches incident history for behavioral matches (name-independent)
  5. Traverses the causal graph for the chain of events
  6. Scores and ranks past remediations by confidence
  7. Generates a human-readable narrative (fast: template, deep: LLM)
"""

import os
from typing import List, Optional
from ..models.schema import IncidentSignal, Context, CausalEdge, IncidentMatch, Remediation
from .dna import DNAService
from .graph import CausalGraphEngine
from .ghost import GhostRegistry


class ReconstructService:
    def __init__(
        self,
        dna_service: DNAService,
        graph_engine: CausalGraphEngine,
        ghost_registry: GhostRegistry,
    ):
        self.dna = dna_service
        self.graph = graph_engine
        self.ghost = ghost_registry

    def reconstruct(self, signal: dict, mode: str = "fast") -> dict:
        incident_id = signal.get("incident_id", "UNKNOWN")
        trigger     = signal.get("trigger", "")

        # ── Step 1: Identify service ──────────────────────────────
        service_id = self.dna._extract_service_from_signal(signal)

        # ── Step 2: Ghost resolution ──────────────────────────────
        # If billing-svc was renamed from payments-svc, we search
        # under BOTH identities.
        ancestor = self.ghost.get_ancestor(service_id)
        ghost_info = self.ghost.mappings.get(service_id)
        search_ids = [service_id]
        if ancestor:
            search_ids.append(ancestor)

        # ── Step 3: Compute incident DNA vector ───────────────────
        query_vector = self.dna.compute_incident_vector(signal)

        # Snapshot this incident in the DNA store for future matching
        self.dna.store_incident(
            incident_id=incident_id,
            service_id=service_id,
            metadata={"trigger": trigger, "ghost_ancestor": ancestor},
        )

        # ── Step 4: Find similar past incidents ───────────────────
        raw_matches = self.dna.find_similar_incidents(
            query_vector=query_vector,
            k=5,
            exclude_incident=incident_id,
        )

        similar_past: List[IncidentMatch] = []
        for past_id, sim, meta in raw_matches:
            rationale = self._build_rationale(
                sim=sim,
                past_service=meta.get("service_id", "unknown"),
                current_service=service_id,
                ancestor=ancestor,
                fingerprint=meta.get("fingerprint", "????"),
            )
            similar_past.append(IncidentMatch(
                past_incident_id=past_id,
                similarity=round(sim, 4),
                rationale=rationale,
            ))

        # ── Step 5: Build causal chain ────────────────────────────
        causal_chain = self.graph.get_causal_chain(incident_id)

        # ── Step 6: Score remediations ────────────────────────────
        remediations = self.graph.get_remediations(service_id, search_ids)

        # ── Step 7: Compute confidence ────────────────────────────
        top_sim = similar_past[0].similarity if similar_past else 0.0
        chain_conf = (
            sum(e.confidence for e in causal_chain) / len(causal_chain)
            if causal_chain else 0.0
        )
        confidence = round((top_sim * 0.6 + chain_conf * 0.4), 4)

        # ── Step 8: Generate narrative ────────────────────────────
        explain = self._build_narrative(
            service_id=service_id,
            incident_id=incident_id,
            trigger=trigger,
            ghost_info=ghost_info,
            causal_chain=causal_chain,
            similar_past=similar_past,
            remediations=remediations,
            confidence=confidence,
            fingerprint=self.dna.get_fingerprint_id(service_id),
            mode=mode,
        )

        return {
            "related_events":         [],   # filled by ingest layer
            "causal_chain":           [e.dict() for e in causal_chain],
            "similar_past_incidents": [m.dict() for m in similar_past],
            "suggested_remediations": [r.dict() for r in remediations],
            "confidence":             confidence,
            "explain":                explain,
        }

    # ──────────────────────────────────────────────────────────────
    # Narrative builders
    # ──────────────────────────────────────────────────────────────

    def _build_rationale(
        self,
        sim: float,
        past_service: str,
        current_service: str,
        ancestor: Optional[str],
        fingerprint: str,
    ) -> str:
        pct = int(sim * 100)
        if ancestor and past_service == ancestor:
            return (
                f"{pct}% behavioral match via Ghost Protocol — "
                f"{current_service} was formerly {ancestor} "
                f"(DNA fingerprint {fingerprint}). "
                f"Same error distribution, latency profile, and deploy pattern detected."
            )
        return (
            f"{pct}% behavioral match — same error bucket, "
            f"latency profile, and event sequence pattern "
            f"(DNA fingerprint {fingerprint})."
        )

    def _build_narrative(
        self,
        service_id: str,
        incident_id: str,
        trigger: str,
        ghost_info: Optional[dict],
        causal_chain: list,
        similar_past: list,
        remediations: list,
        confidence: float,
        fingerprint: str,
        mode: str,
    ) -> str:
        parts = []

        # Opening
        ghost_clause = ""
        if ghost_info:
            old = ghost_info.get("old_id", "unknown")
            sim = ghost_info.get("similarity", 0)
            ghost_clause = (
                f", formerly {old} via Ghost Protocol "
                f"(DNA similarity {sim:.2f})"
            )
        parts.append(
            f"{service_id} (DNA fingerprint {fingerprint}{ghost_clause}) "
            f"triggered {trigger} [{incident_id}]."
        )

        # Causal chain summary
        if causal_chain:
            chain_str = " → ".join(
                f"{e.cause_id}" for e in causal_chain[:3]
            )
            top_conf = causal_chain[0].confidence if causal_chain else 0
            parts.append(
                f"Causal chain: {chain_str} "
                f"(confidence {top_conf:.2f})."
            )

        # Past incident match
        if similar_past:
            top = similar_past[0]
            pct = int(top.similarity * 100)
            parts.append(
                f"Historical DNA analysis found {pct}% behavioral match "
                f"to {top.past_incident_id}. {top.rationale}"
            )

        # Remediation
        if remediations:
            top_r = remediations[0]
            parts.append(
                f"Recommended action: {top_r.action} {top_r.target}. "
                f"Historical outcome: {top_r.historical_outcome}. "
                f"Confidence: {top_r.confidence:.2f}."
            )

        parts.append(f"Overall reconstruction confidence: {confidence:.2f}.")
        return " ".join(parts)

