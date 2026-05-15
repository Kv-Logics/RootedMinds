"use client";
import { useState } from "react";
import { AlertTriangle, Ghost, GitPullRequest, CheckCircle, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import { type Context, createPR } from "@/lib/api";

type Props = {
  incidentId: string;
  trigger: string;
  context: Context;
  onResolved?: () => void;
};

export function IncidentCard({ incidentId, trigger, context, onResolved }: Props) {
  const [prState, setPrState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [prError, setPrError] = useState<string | null>(null);

  const topMatch   = context.similar_past_incidents?.[0];
  const topRemed   = context.suggested_remediations?.[0];
  const topChain   = context.causal_chain?.slice(0, 3) ?? [];
  const hasGhost   = topMatch?.rationale?.includes("Ghost Protocol");
  const serviceName = trigger.includes(":") ? trigger.split(":")[1]?.split("/")?.[0] ?? "service" : "service";

  const handleCreatePR = async () => {
    setPrState("loading");
    try {
      const result = await createPR(incidentId, serviceName, context);
      if (result.success && result.pr_url) {
        setPrUrl(result.pr_url);
        setPrState("done");
      } else {
        setPrError(result.error ?? "Unknown error");
        setPrState("error");
      }
    } catch (e: any) {
      setPrError(e.message);
      setPrState("error");
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-red-900/40 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-red-950/30 border-b border-red-900/30 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-red-400 font-bold text-sm tracking-wide">{incidentId}</span>
          <span className="text-gray-500 text-xs">·</span>
          <span className="text-gray-400 text-xs truncate max-w-xs">{trigger}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className={`text-sm font-bold ${context.confidence > 0.7 ? "text-green-400" : "text-amber-400"}`}>
            {Math.round(context.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Causal Chain */}
        {topChain && topChain.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-semibold">Causal Chain</p>
            <div className="flex items-center gap-1 flex-wrap">
              {topChain.map((edge, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-300">
                    {edge.cause_id.length > 30 ? edge.cause_id.slice(0, 30) + "…" : edge.cause_id}
                  </div>
                  <div className="flex flex-col items-center">
                    <ChevronRight size={12} className="text-gray-600" />
                    <span className="text-[9px] text-[#FF9933] font-mono">{edge.confidence.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {topChain[topChain.length - 1] && (
                <div className="bg-red-950/40 border border-red-900/40 rounded px-2 py-1 text-xs font-mono text-red-400">
                  {topChain[topChain.length - 1].effect_id.length > 30
                    ? topChain[topChain.length - 1].effect_id.slice(0, 30) + "…"
                    : topChain[topChain.length - 1].effect_id}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ghost Match */}
        {topMatch && (
          <div className={`rounded-lg p-4 border ${hasGhost ? "border-[#FF9933]/30 bg-[#FF993308]" : "border-gray-800 bg-[#111]"}`}>
            <div className="flex items-center gap-2 mb-2">
              {hasGhost && <Ghost size={14} className="text-[#FF9933]" />}
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {hasGhost ? "Ghost Protocol Match" : "Similar Past Incident"}
              </span>
              <span className={`ml-auto text-sm font-bold ${topMatch.similarity > 0.8 ? "text-[#FF9933]" : "text-amber-500"}`}>
                {Math.round(topMatch.similarity * 100)}% match
              </span>
            </div>
            <p className="text-sm font-mono text-white">{topMatch.past_incident_id}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{topMatch.rationale}</p>
          </div>
        )}

        {/* Suggested Remediation */}
        {topRemed && (
          <div className="rounded-lg p-4 border border-gray-800 bg-[#111]">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-semibold">Suggested Remediation</p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white">
                  <span className="font-mono text-[#FF9933]">{topRemed.action}</span>{" "}
                  <span className="text-gray-300">{topRemed.target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Historical outcome: <span className="text-green-400">{topRemed.historical_outcome}</span>
                  {" · "}Confidence: <span className="text-[#FF9933]">{topRemed.confidence.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Narrative */}
        <div className="rounded-lg p-4 border border-gray-800 bg-[#0d0d0d]">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-semibold">Engine Narrative</p>
          <p className="text-xs text-gray-300 leading-relaxed font-mono">{context.explain}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {/* Create PR Button */}
          {prState === "idle" && (
            <button
              onClick={handleCreatePR}
              className="flex items-center gap-2 bg-[#FF9933] hover:bg-[#e8882e] text-black font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <GitPullRequest size={15} />
              Create Fix PR
            </button>
          )}
          {prState === "loading" && (
            <button disabled className="flex items-center gap-2 bg-gray-800 text-gray-400 font-bold text-sm px-4 py-2.5 rounded-lg">
              <Loader2 size={15} className="animate-spin" />
              Creating PR...
            </button>
          )}
          {prState === "done" && prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-900/40 hover:bg-green-900/60 border border-green-700/50 text-green-400 font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <CheckCircle size={15} />
              View PR on GitHub
              <ExternalLink size={12} />
            </a>
          )}
          {prState === "error" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">{prError}</span>
              <button onClick={() => setPrState("idle")} className="text-xs text-gray-500 hover:text-gray-300 underline">Retry</button>
            </div>
          )}

          {/* Mark Resolved */}
          <button
            onClick={onResolved}
            className="flex items-center gap-2 bg-transparent hover:bg-green-950/30 border border-green-900/40 text-green-500 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors ml-auto"
          >
            <CheckCircle size={15} />
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
