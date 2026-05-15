"use client";
import { useState } from "react";
import { AlertTriangle, Ghost, GitPullRequest, CheckCircle, Loader2, ExternalLink, ChevronRight, Database, Share2, GitBranch, Server, Activity, Clock, Layers, GitCommit, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  const [isScanning, setIsScanning] = useState(true);

  // Stop scanning after 3 seconds
  if (isScanning && hasGhost) {
    setTimeout(() => setIsScanning(false), 3000);
  }

  return (
    <div className={`bg-[#0A0A0A] border rounded-xl overflow-hidden transition-all duration-500 relative ${hasGhost ? "border-[#FF9933]/50 shadow-[0_0_20px_rgba(255,153,51,0.1)]" : "border-red-900/40"}`}>
      {/* Ghost Scanning Overlay */}
      {hasGhost && isScanning && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 z-0 rounded-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FF9933] shadow-[0_0_10px_#FF9933] animate-scan" />
        </div>
      )}

      {/* Header */}
      <div className={`${hasGhost ? "bg-[#FF993315] border-[#FF993330]" : "bg-red-950/30 border-red-900/30"} border-b px-5 py-3 flex items-center justify-between relative z-10`}>
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

      <div className="p-5 space-y-5 relative z-10">
        {/* Causal Chain */}
        {topChain && topChain.length > 0 && (
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold flex items-center gap-2">
              <GitBranch size={14} className="text-gray-400" />
              Diagnostic Causal Graph
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
              {topChain.map((edge, i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* Node */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-900/50 to-gray-800 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative bg-[#0d0d0d] border border-gray-700/60 rounded-xl px-4 py-3 text-sm font-mono text-gray-200 min-w-[140px] shadow-lg flex items-center gap-3">
                      <div className="bg-blue-900/30 p-1.5 rounded-md">
                        <Server size={14} className="text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Origin Node</span>
                        <span className="font-semibold">{edge.cause_id.length > 18 ? edge.cause_id.slice(0, 18) + "…" : edge.cause_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Arrow */}
                  <div className="flex flex-col items-center justify-center w-16 relative">
                    <span className="text-[10px] font-bold text-[#FF9933] font-mono mb-1 bg-[#FF9933]/10 px-2 py-0.5 rounded-full border border-[#FF9933]/30">
                      {Math.round(edge.confidence * 100)}%
                    </span>
                    <div className="w-full flex items-center">
                      <div className="w-full h-[2px] bg-gradient-to-r from-gray-700 via-[#FF993380] to-gray-700 relative">
                        <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-[#FF9933] rounded-full -translate-y-1/2 shadow-[0_0_10px_#FF9933] animate-flow-horizontal"></div>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 -ml-2" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Target Node (The Crash) */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-red-600/30 rounded-xl blur opacity-40 animate-pulse"></div>
                <div className="relative bg-red-950/40 border border-red-500/50 rounded-xl px-4 py-3 text-sm font-mono text-red-300 min-w-[140px] shadow-[0_0_15px_rgba(220,38,38,0.15)] flex items-center gap-3">
                  <div className="bg-red-500/20 p-1.5 rounded-md">
                    <Activity size={14} className="text-red-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-red-500/80 uppercase tracking-widest font-bold">Crash Point</span>
                    <span className="font-bold">{topChain[topChain.length - 1].effect_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ghost Match */}
        {topMatch && (
          <div className={`rounded-xl p-5 border transition-all duration-700 ${hasGhost ? "border-[#FF9933]/40 bg-[#FF993308] shadow-[inset_0_0_15px_rgba(255,153,51,0.05)]" : "border-gray-800 bg-[#111]"}`}>
            <div className="flex items-center gap-3 mb-3">
              {hasGhost ? (
                <div className="bg-[#FF993320] p-1.5 rounded-md border border-[#FF9933]/30">
                  <Ghost size={16} className="text-[#FF9933]" />
                </div>
              ) : (
                <div className="bg-gray-800 p-1.5 rounded-md border border-gray-700">
                  <Database size={16} className="text-gray-400" />
                </div>
              )}
              <span className={`text-xs font-bold uppercase tracking-[0.2em] ${hasGhost ? "text-[#FF9933]" : "text-gray-400"}`}>
                {hasGhost ? "Ghost Protocol Identity Found" : "Historical DNA Match"}
              </span>
              <div className="ml-auto flex items-center gap-3">
                <div className="w-20 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div className={`h-full ${hasGhost ? "bg-[#FF9933]" : "bg-amber-500"}`} style={{ width: `${topMatch.similarity * 100}%` }} />
                </div>
                <span className={`text-sm font-bold font-mono ${topMatch.similarity > 0.8 ? "text-[#FF9933]" : "text-amber-500"}`}>
                  {Math.round(topMatch.similarity * 100)}%
                </span>
              </div>
            </div>
            <p className={`text-base font-bold font-mono ${hasGhost ? "text-white" : "text-gray-200"}`}>{topMatch.past_incident_id}</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed border-l-2 border-gray-700 pl-3 italic">"{topMatch.rationale}"</p>
          </div>
        )}

        {/* DNA Fingerprint Breakdown (Hackathon Flex) */}
        <div className="rounded-xl p-5 border border-blue-900/40 bg-[#060b14] relative overflow-hidden group shadow-inner">
          <div className="absolute top-0 left-0 w-[3px] h-0 bg-blue-500 group-hover:h-full transition-all duration-500" />
          <p className="text-xs uppercase tracking-widest text-blue-400 mb-4 font-bold flex items-center gap-2">
            <CheckCircle size={14} className="text-blue-500" />
            DNA Matching Algorithm — Complete
          </p>
          <div className="text-xs text-gray-400 font-mono space-y-2.5">
            <p className="text-gray-300 mb-3 font-sans text-sm font-semibold">The 28 dimensions analyzed:</p>
            <div className="flex items-start gap-3"><Activity size={14} className="text-red-400 mt-0.5 flex-shrink-0" /><p><span className="text-red-400 font-bold">Dim 0-4:</span> Error rate, errors-per-deploy, error diversity, volume, rollback rate</p></div>
            <div className="flex items-start gap-3"><Clock size={14} className="text-amber-400 mt-0.5 flex-shrink-0" /><p><span className="text-amber-400 font-bold">Dim 5-8:</span> Latency P50/P90/P95/P99 (normalized)</p></div>
            <div className="flex items-start gap-3"><Layers size={14} className="text-blue-400 mt-0.5 flex-shrink-0" /><p><span className="text-blue-400 font-bold">Dim 9-12:</span> Event kind mix (deploy/log/metric/trace ratios)</p></div>
            <div className="flex items-start gap-3"><GitCommit size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /><p><span className="text-emerald-400 font-bold">Dim 13-16:</span> Temporal incident patterns</p></div>
            <div className="flex items-start gap-3"><GitBranch size={14} className="text-orange-400 mt-0.5 flex-shrink-0" /><p><span className="text-orange-400 font-bold">Dim 17-20:</span> Deploy frequency and rollback ratio</p></div>
            <div className="flex items-start gap-3"><Database size={14} className="text-purple-400 mt-0.5 flex-shrink-0" /><p><span className="text-purple-400 font-bold">Dim 21-24:</span> Error message semantic buckets (connection/db/memory/auth)</p></div>
            <div className="flex items-start gap-3"><Settings size={14} className="text-gray-300 mt-0.5 flex-shrink-0" /><p><span className="text-gray-300 font-bold">Dim 25-27:</span> Remediation success rate</p></div>
          </div>
        </div>

        {/* Narrative */}
        <div className="rounded-xl p-5 border border-gray-800 bg-[#0a0a0a] relative overflow-hidden group shadow-inner">
          <div className="absolute top-0 left-0 w-[3px] h-0 bg-[#FF9933] group-hover:h-full transition-all duration-500" />
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold flex items-center gap-2">
            <Server size={14} />
            AI Analytic Narrative
          </p>
          <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{context.explain}</p>
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
          
          <button
            onClick={() => {
              sessionStorage.setItem('currentGraphContext', JSON.stringify({ context, incidentId, trigger }));
              router.push(`/dashboard/graph?incidentId=${incidentId}`);
            }}
            className="flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-lg transition-all bg-gray-800 text-white hover:bg-gray-700"
          >
            <Share2 size={14} />
            View Advanced Graph
          </button>
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
