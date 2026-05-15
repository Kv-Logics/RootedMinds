"""
demo_seed.py — Live Dashboard Demo Simulator
=============================================
Sends a scripted sequence of events to the engine in real-time.
Watch the dashboard as it lights up — no ShopFlow needed.

Usage:
    cd backend
    python demo_seed.py

What you will see on the dashboard:
    1. Deploy event for payment-service v1.0.0
    2. Error logs flooding in
    3. Latency spike metric
    4. INC-001 fires → dashboard auto-switches to Incidents tab
    5. Engine reconstructs context (shows causal chain)
    6. 3 second pause...
    7. Rename event (Ghost Protocol activates)
    8. New errors on billing-engine
    9. INC-002 fires → engine matches 91.7% to INC-001
   10. "Create Fix PR" button appears on dashboard
"""

import httpx, asyncio, time
from datetime import datetime, timezone, timedelta

API = "http://localhost:8000"

def now(offset_seconds=0):
    dt = datetime.now(timezone.utc) - timedelta(seconds=offset_seconds)
    return dt.isoformat()

async def send(events: list, label: str):
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(f"{API}/api/v1/ingest", json=events)
        status = resp.status_code
    print(f"  [{status}] {label}")

async def pause(seconds: float, msg: str = ""):
    if msg:
        print(f"\n  ... {msg} ...")
    await asyncio.sleep(seconds)

async def run():
    print("\n" + "="*55)
    print("  SENTINEL — Live Demo Simulator")
    print("  Open http://localhost:3001/dashboard now!")
    print("="*55 + "\n")

    await pause(2, "Starting in 2 seconds — switch to your browser")

    # ── Phase 1: Historical context (7 days ago) ─────────────────
    print("\n[PHASE 1] Loading historical incident INC-001...")
    await send([
        {"ts": now(604800), "kind": "deploy",
         "service": "payment-service", "version": "v1.0.0", "actor": "ci"},
    ], "Deploy payment-service v1.0.0")
    await pause(1)

    await send([
        {"ts": now(604700), "kind": "log", "service": "payment-service",
         "level": "error", "msg": "too many connections to database"},
        {"ts": now(604680), "kind": "log", "service": "payment-service",
         "level": "error", "msg": "connection pool exhausted after 3 concurrent requests"},
        {"ts": now(604660), "kind": "log", "service": "storefront",
         "level": "error", "msg": "timeout calling payment-service after 30s"},
    ], "Error logs flooding in")
    await pause(1)

    await send([
        {"ts": now(604600), "kind": "metric", "service": "payment-service",
         "name": "latency_p99_ms", "value": 8200.0},
        {"ts": now(604580), "kind": "metric", "service": "payment-service",
         "name": "latency_p99_ms", "value": 9100.0},
        {"ts": now(604560), "kind": "metric", "service": "payment-service",
         "name": "error_rate", "value": 0.42},
    ], "Latency spike metrics")
    await pause(1)

    await send([
        {"ts": now(604500), "kind": "incident_signal",
         "incident_id": "INC-001", "service": "payment-service",
         "trigger": "alert:payment-service/error-rate>40%"},
    ], "INC-001 FIRED — watch Incidents tab!")
    await pause(2)

    await send([
        {"ts": now(86400), "kind": "deploy",
         "service": "payment-service", "version": "v1.1.0", "actor": "engineer_priya"},
        {"ts": now(86300), "kind": "remediation",
         "incident_id": "INC-001", "service": "payment-service",
         "action": "deploy", "target": "payment-service",
         "version": "v1.1.0", "outcome": "resolved"},
    ], "Bad fix deployed — INC-001 marked resolved")
    await pause(1)

    # ── Phase 2: The new service (today) ─────────────────────────
    print("\n[PHASE 2] Simulating billing-engine (the renamed service)...")
    await pause(2, "Simulating 7-day gap — watch Ghost Protocol activate")

    await send([
        {"ts": now(120), "kind": "topology", "change": "rename",
         "from": "payment-service", "to": "billing-engine"},
    ], "TOPOLOGY RENAME — Ghost Protocol activated!")
    await pause(1.5)

    await send([
        {"ts": now(100), "kind": "deploy",
         "service": "billing-engine", "version": "v1.2.0", "actor": "ci"},
    ], "billing-engine v1.2.0 deployed")
    await pause(1)

    # ── Phase 3: The new incident ─────────────────────────────────
    print("\n[PHASE 3] Triggering INC-002 on billing-engine...")

    await send([
        {"ts": now(60), "kind": "log", "service": "billing-engine",
         "level": "error", "msg": "max client connections reached during refund processing"},
        {"ts": now(55), "kind": "log", "service": "billing-engine",
         "level": "error", "msg": "connection pool exhausted — refund endpoint failed"},
    ], "Same error pattern as INC-001 (different service name)")
    await pause(1)

    await send([
        {"ts": now(45), "kind": "metric", "service": "billing-engine",
         "name": "latency_p99_ms", "value": 7500.0},
        {"ts": now(40), "kind": "metric", "service": "billing-engine",
         "name": "error_rate", "value": 0.38},
    ], "Latency spike (similar to INC-001 pattern)")
    await pause(1)

    await send([
        {"ts": now(10), "kind": "incident_signal",
         "incident_id": "INC-002", "service": "billing-engine",
         "trigger": "alert:billing-engine/error-rate>30%"},
    ], "INC-002 FIRED — engine matching to INC-001 now!")
    await pause(3)

    print("\n" + "="*55)
    print("  DEMO COMPLETE")
    print("  Check your dashboard — you should see:")
    print("    - INC-001 and INC-002 in the Incidents tab")
    print("    - 91%+ DNA similarity match")
    print("    - Ghost Protocol: billing-engine = payment-service")
    print("    - 'Create Fix PR' button (needs GitHub token)")
    print("="*55 + "\n")

if __name__ == "__main__":
    asyncio.run(run())
