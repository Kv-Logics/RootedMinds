/**
 * api.ts — Typed API client for the Persistent Context Engine
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────

export type CausalEdge = {
  cause_id: string;
  effect_id: string;
  evidence: string;
  confidence: number;
};

export type IncidentMatch = {
  past_incident_id: string;
  similarity: number;
  rationale: string;
};

export type Remediation = {
  action: string;
  target: string;
  historical_outcome: string;
  confidence: number;
};

export type Context = {
  related_events: unknown[];
  causal_chain: CausalEdge[];
  similar_past_incidents: IncidentMatch[];
  suggested_remediations: Remediation[];
  confidence: number;
  explain: string;
};

export type PRResult = {
  success: boolean;
  pr_url: string | null;
  branch_name: string | null;
  pr_number: number | null;
  error: string | null;
};

// ── API calls ─────────────────────────────────────────────────────

export async function ingestEvents(events: unknown[]) {
  const res = await fetch(`${BASE}/api/v1/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
  });
  return res.json();
}

export async function reconstructContext(
  incident_id: string,
  trigger: string,
  ts: string,
  mode: "fast" | "deep" = "fast"
): Promise<Context> {
  const res = await fetch(`${BASE}/api/v1/reconstruct?mode=${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident_id, trigger, ts }),
  });
  return res.json();
}

export async function createPR(
  incident_id: string,
  service_name: string,
  context: Context,
  repo?: string
): Promise<PRResult> {
  const res = await fetch(`${BASE}/api/v1/pr/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident_id, service_name, context, repo }),
  });
  return res.json();
}

export async function getPRStatus(): Promise<{ ready: boolean; github_token_configured: boolean; github_repo_configured: boolean }> {
  const res = await fetch(`${BASE}/api/v1/pr/status`);
  return res.json();
}
