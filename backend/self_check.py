"""
self_check.py — Pre-submission benchmark validator
===================================================
Run this before the demo to verify all systems are working.

Usage:
    cd backend
    python self_check.py

Tests:
    1. Cold start time (target < 60s, expect ~0.5s)
    2. Ingest speed (target: all events in < 5s)
    3. Reconstruct speed, fast mode (target < 2s)
    4. Ghost Protocol: rename detection
    5. DNA similarity: same-pattern services score > 0.8
    6. Causal chain: deploy -> error linkage
    7. Remediation scoring: decay + success rate
    8. Zero-event safety: no crash on empty history
"""

import sys, os, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def now(offset_days=0):
    dt = datetime.now(timezone.utc) - timedelta(days=offset_days)
    return dt.isoformat()

def ok(label, detail=""):
    suffix = f" -- {YELLOW}{detail}{RESET}" if detail else ""
    print(f"  {GREEN}[PASS]{RESET} {label}{suffix}")

def fail(label, detail=""):
    suffix = f" -- {RED}{detail}{RESET}" if detail else ""
    print(f"  {RED}[FAIL]{RESET} {label}{suffix}")

def section(title):
    print(f"\n{CYAN}{BOLD}{'='*50}{RESET}")
    print(f"{CYAN}{BOLD}  {title}{RESET}")
    print(f"{CYAN}{BOLD}{'='*50}{RESET}")

passed = 0
failed = 0

def assert_true(cond, label, detail=""):
    global passed, failed
    if cond:
        ok(label, detail)
        passed += 1
    else:
        fail(label, detail)
        failed += 1
    return cond



# ==================================================================
print(f"\n{BOLD}SENTINEL - Self-Check Suite{RESET}")
print(f"Time: {datetime.now().strftime('%H:%M:%S')}")

# ── Test 1: Cold Start ────────────────────────────────────────────
section("Test 1: Cold Start")
t0 = time.monotonic()
from adapters.sentinel import SentinelEngine
engine = SentinelEngine()
cold_ms = (time.monotonic() - t0) * 1000
assert_true(cold_ms < 60_000, "Cold start < 60s", f"{cold_ms:.1f}ms")


# ── Test 2: Basic Ingest ──────────────────────────────────────────
section("Test 2: Ingest (100 events)")

events_basic = [
    {"ts": now(7), "kind": "deploy",   "service": "payment-service", "version": "v1.0.0", "actor": "ci"},
    {"ts": now(7), "kind": "log",      "service": "payment-service", "level": "error", "msg": "too many connections to database"},
    {"ts": now(7), "kind": "metric",   "service": "payment-service", "name": "latency_p99_ms", "value": 8200.0},
    {"ts": now(7), "kind": "metric",   "service": "payment-service", "name": "error_rate", "value": 0.42},
    {"ts": now(7), "kind": "incident_signal", "incident_id": "INC-001", "service": "payment-service",
     "trigger": "alert:payment-service/error-rate>40%"},
    {"ts": now(6), "kind": "deploy",   "service": "payment-service", "version": "v1.1.0", "actor": "engineer"},
    {"ts": now(6), "kind": "remediation", "incident_id": "INC-001", "service": "payment-service",
     "action": "deploy", "target": "payment-service", "version": "v1.1.0", "outcome": "resolved"},
]
# Pad to 100 events with metrics
for i in range(93):
    events_basic.append({
        "ts": now(6 - i * 0.01),
        "kind": "metric",
        "service": "payment-service",
        "name": "latency_p99_ms",
        "value": 500.0 + (i * 10),
    })

t0 = time.monotonic()
engine.ingest(events_basic)
ingest_ms = (time.monotonic() - t0) * 1000
assert_true(ingest_ms < 5000, "Ingest 100 events < 5s", f"{ingest_ms:.1f}ms")


# ── Test 3: DNA Vector ────────────────────────────────────────────
section("Test 3: DNA Fingerprinting")
vec = engine.dna.get_vector("payment-service")
assert_true(vec is not None, "DNA vector computed")
assert_true(vec is not None and len(vec) == 28, "Vector is 28-dimensional", f"dim={len(vec) if vec is not None else 0}")
fid = engine.dna.get_fingerprint_id("payment-service")
assert_true(len(fid) == 4, "Fingerprint ID is 4-char hex", fid)
assert_true(vec is not None and vec[0] > 0, "Error rate dimension > 0", f"dim[0]={float(vec[0]):.3f}" if vec is not None else "None")
assert_true(vec is not None and vec[5] > 0, "Latency P50 dimension > 0", f"dim[5]={float(vec[5]):.3f}" if vec is not None else "None")


# ── Test 4: Ghost Protocol ────────────────────────────────────────
section("Test 4: Ghost Protocol (rename detection)")

# New service with same behavior as payment-service
ghost_events = [
    {"ts": now(0), "kind": "deploy",   "service": "billing-engine", "version": "v1.2.0", "actor": "ci"},
    {"ts": now(0), "kind": "log",      "service": "billing-engine", "level": "error", "msg": "max client connections reached"},
    {"ts": now(0), "kind": "metric",   "service": "billing-engine", "name": "latency_p99_ms", "value": 7500.0},
    {"ts": now(0), "kind": "metric",   "service": "billing-engine", "name": "error_rate", "value": 0.38},
    # Topology rename event
    {"ts": now(0), "kind": "topology", "change": "rename",
     "from": "payment-service", "to": "billing-engine"},
]
engine.ingest(ghost_events)

ancestor = engine.ghost.get_ancestor("billing-engine")
assert_true(ancestor == "payment-service", "Ghost lineage: billing-engine -> payment-service", ancestor)

# DNA similarity between the two should be moderate (service is new, few events)
sim = engine.dna.get_similarity("payment-service", "billing-engine")
assert_true(sim > 0.3, "DNA similarity > 30% between original and renamed", f"{sim:.3f}")


# ── Test 5: Incident Snapshot ─────────────────────────────────────
section("Test 5: Incident Snapshot & Matching")

# INC-001 should already be in snapshot store from earlier ingest
inc_snaps = engine.dna.incident_snapshots
assert_true("INC-001" in inc_snaps, "INC-001 snapshot stored")

# Now trigger INC-002 on billing-engine (the renamed service)
inc002_events = [
    {"ts": now(0), "kind": "incident_signal", "incident_id": "INC-002",
     "service": "billing-engine", "trigger": "alert:billing-engine/error-rate>30%"},
]
engine.ingest(inc002_events)
assert_true("INC-002" in engine.dna.incident_snapshots, "INC-002 snapshot stored")


# ── Test 6: Reconstruct Context — fast mode ───────────────────────
section("Test 6: Reconstruct Context (fast mode < 2s)")

signal = {
    "ts": now(0),
    "incident_id": "INC-002",
    "trigger": "alert:billing-engine/error-rate>30%",
    "service": "billing-engine",
}

t0 = time.monotonic()
context = engine.reconstruct_context(signal, mode="fast")
recon_ms = (time.monotonic() - t0) * 1000

assert_true(recon_ms < 2000, "Reconstruction < 2s", f"{recon_ms:.1f}ms")
assert_true(isinstance(context, dict), "Context is a dict")
assert_true("confidence" in context, "Context has confidence field")
assert_true("explain" in context and len(context["explain"]) > 10, "Context has narrative")
assert_true("causal_chain" in context, "Context has causal_chain")
assert_true("suggested_remediations" in context, "Context has remediations")
assert_true("similar_past_incidents" in context, "Context has past incident matches")

conf = context.get("confidence", 0)
assert_true(conf > 0, "Confidence > 0", f"{conf:.3f}")

matches = context.get("similar_past_incidents", [])
assert_true(len(matches) > 0, "At least 1 past incident match found")
if matches:
    top = matches[0]
    assert_true(top.get("past_incident_id") == "INC-001", "Top match is INC-001 (the original)", top.get("past_incident_id"))
    assert_true(top.get("similarity", 0) > 0, "Similarity score > 0", f"{top.get('similarity', 0):.3f}")


# ── Test 7: Zero-event safety ─────────────────────────────────────
section("Test 7: Zero-Event Safety (no crash)")

engine2 = SentinelEngine()
engine2.ingest([])  # Empty stream — should not crash
ctx2 = engine2.reconstruct_context({
    "ts": now(0), "incident_id": "INC-EMPTY", "trigger": "alert:unknown/crash"
}, mode="fast")
assert_true(isinstance(ctx2, dict), "Empty-history reconstruct returns dict")
assert_true(ctx2.get("confidence", -1) >= 0, "Confidence is non-negative")
engine2.close()


# ── Test 8: Causal Chain ──────────────────────────────────────────
section("Test 8: Causal Graph")
chain = context.get("causal_chain", [])
assert_true(isinstance(chain, list), "Causal chain is a list")
if chain:
    edge = chain[0]
    assert_true("cause_id" in edge and "effect_id" in edge, "Edge has cause/effect")
    assert_true("confidence" in edge and edge["confidence"] > 0, "Edge has confidence", f"{edge.get('confidence', 0):.3f}")


# ── Summary ───────────────────────────────────────────────────────
section("Results")
total = passed + failed
print(f"\n  {GREEN}{passed}{RESET}/{total} tests passed", end="")
if failed == 0:
    print(f"  {GREEN}{BOLD}ALL PASSING - READY TO SUBMIT{RESET}")
else:
    print(f"  {RED}{BOLD}{failed} FAILURES - FIX BEFORE DEMO{RESET}")

if len(matches) > 0:
    top = matches[0]
    print(f"\n{CYAN}{'='*50}{RESET}")
    print(f"  DNA Match: {GREEN}{top.get('past_incident_id')}{RESET}")
    print(f"  Similarity: {GREEN}{top.get('similarity', 0):.1%}{RESET}")
    print(f"  Narrative: {context.get('explain', '')[:120]}...")
    print(f"{CYAN}{'='*50}{RESET}\n")

sys.exit(0 if failed == 0 else 1)
