"use client";
import { useState } from "react";
import { AlertTriangle, Ghost, GitPullRequest, CheckCircle, Loader2, ExternalLink, ChevronRight, Database } from "lucide-react";
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
  const hasGhost   = topMatch?.rationale?.includes("Ghost Protocol") || context.explain?.includes("IDENTITY REVEAL");
  const serviceName = trigger.includes(":") ? trigger.split(":")[1]?.split("/")?.[0] ?? "service" : "service";

  // Generate a fake "DNA Barcode" based on incident context
  const dnaSegments = (incidentId + trigger).split("").map(c => c.charCodeAt(0) % 5 + 1);

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
    <div className={`bg-[#0A0A0A] border rounded-xl overflow-hidden transition-all duration-500 ${hasGhost ? "border-[#FF9933]/50 shadow-[0_0_20px_rgba(255,153,51,0.1)]" : "border-red-900/40"}`}>
      {/* Ghost Scanning Overlay */}
      {hasGhost && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FF9933] shadow-[0_0_10px_#FF9933] animate-scan" />
        </div>
      )}

      {/* Header */}
      <div className={`${hasGhost ? "bg-[#FF993315] border-[#FF993330]" : "bg-red-950/30 border-red-900/30"} border-b px-5 py-3 flex items-center justify-between relative`}>
        <div className="flex items-center gap-2">
          {hasGhost ? <Ghost size={16} className="text-[#FF9933] animate-pulse" /> : <AlertTriangle size={16} className="text-red-400" />}
          <span className={`${hasGhost ? "text-[#FF9933]" : "text-red-400"} font-bold text-sm tracking-wide`}>{incidentId}</span>
          <span className="text-gray-500 text-xs">·</span>
          <span className="text-gray-400 text-xs truncate max-w-[150px]">{trigger}</span>
        </div>

        {/* DNA Fingerprint Visual */}
        <div className="flex items-center gap-0.5 opacity-40">
          {dnaSegments.map((h, i) => (
            <div key={i} className={`w-0.5 bg-gray-500`} style={{ height: `${h * 3}px` }} />
          ))}
          <span className="text-[8px] text-gray-600 ml-2 font-mono uppercase tracking-tighter">DNA_SIGNATURE</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className={`text-sm font-bold ${context.confidence > 0.7 ? "text-green-400" : "text-amber-400"}`}>
            {Math.round(context.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 relative">
        {/* Causal Chain */}
        {topChain && topChain.length > 0 && (
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4 font-semibold">Diagnostic Causal Graph</p>
            <div className="flex items-center gap-0 overflow-x-auto pb-2 no-scrollbar">
              {topChain.map((edge, i) => (
                <div key={i} className="flex items-center">
                  {/* Node */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-[#111] border border-gray-800 rounded-lg px-3 py-2 text-[10px] font-mono text-gray-300 min-w-[120px] text-center">
                      <div className="text-[8px] text-gray-600 mb-1 uppercase tracking-tighter">service_origin</div>
                      {edge.cause_id.length > 18 ? edge.cause_id.slice(0, 18) + "…" : edge.cause_id}
                    </div>
                  </div>

                  {/* Animated Line */}
                  <div className="flex items-center w-12 relative h-4">
                    <div className="w-full h-[1px] bg-gradient-to-r from-gray-800 via-[#FF993350] to-gray-800"></div>
                    <div className="absolute top-1/2 left-0 w-1 h-1 bg-[#FF9933] rounded-full -translate-y-1/2 shadow-[0_0_8px_#FF9933] animate-flow-horizontal"></div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#FF9933] font-mono">
                      {Math.round(edge.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))}

              {/* Target Node (The Crash) */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-red-500 rounded-lg blur opacity-10 animate-pulse"></div>
                <div className="relative bg-red-950/20 border border-red-500/30 rounded-lg px-3 py-2 text-[10px] font-mono text-red-400 min-w-[120px] text-center">
                  <div className="text-[8px] text-red-900 mb-1 uppercase tracking-tighter">crash_point</div>
                  {topChain[topChain.length - 1].effect_id}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ghost Match */}
        {topMatch && (
          <div className={`rounded-lg p-4 border transition-all duration-700 ${hasGhost ? "border-[#FF9933]/40 bg-[#FF993308] shadow-[inset_0_0_15px_rgba(255,153,51,0.05)]" : "border-gray-800 bg-[#111]"}`}>
            <div className="flex items-center gap-2 mb-2">
              {hasGhost ? (
                <div className="bg-[#FF993320] p-1 rounded">
                  <Ghost size={14} className="text-[#FF9933]" />
                </div>
              ) : (
                <div className="bg-gray-800 p-1 rounded">
                  <Database size={14} className="text-gray-400" />
                </div>
              )}
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${hasGhost ? "text-[#FF9933]" : "text-gray-400"}`}>
                {hasGhost ? "Ghost Protocol Identity Found" : "Historical DNA Match"}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-16 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className={`h-full ${hasGhost ? "bg-[#FF9933]" : "bg-amber-500"}`} style={{ width: `${topMatch.similarity * 100}%` }} />
                </div>
                <span className={`text-xs font-bold font-mono ${topMatch.similarity > 0.8 ? "text-[#FF9933]" : "text-amber-500"}`}>
                  {Math.round(topMatch.similarity * 100)}%
                </span>
              </div>
            </div>
            <p className={`text-sm font-bold font-mono ${hasGhost ? "text-white" : "text-gray-300"}`}>{topMatch.past_incident_id}</p>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed italic">"{topMatch.rationale}"</p>
          </div>
        )}

        {/* Narrative */}
        <div className="rounded-lg p-4 border border-gray-900 bg-[#080808] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#FF9933] group-hover:h-full transition-all duration-300" />
          <p className="text-[10px] uppercase tracking-widest text-gray-700 mb-2 font-bold">AI Analytic Narrative</p>
          <p className="text-[11px] text-gray-400 leading-relaxed font-mono whitespace-pre-wrap">{context.explain}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {prState === "idle" && (
            <button
              onClick={handleCreatePR}
              className={`flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-lg transition-all transform hover:scale-105 ${hasGhost ? "bg-[#FF9933] text-black hover:shadow-[0_0_15px_rgba(255,153,51,0.4)]" : "bg-white text-black"}`}
            >
              <GitPullRequest size={14} />
              Generate Engine Fix
            </button>
          )}
          {prState === "loading" && (
            <button disabled className="flex items-center gap-2 bg-gray-900 text-gray-600 font-bold text-xs px-5 py-2.5 rounded-lg">
              <Loader2 size={14} className="animate-spin" />
              Synthesizing...
            </button>
          )}
          {prState === "done" && prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xs px-5 py-2.5 rounded-lg transition-all hover:bg-green-500/20"
            >
              <CheckCircle size={14} />
              Review Pull Request
              <ExternalLink size={10} />
            </a>
          )}

          <button
            onClick={onResolved}
            className="flex items-center gap-2 bg-transparent hover:bg-gray-900 text-gray-500 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors ml-auto"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
