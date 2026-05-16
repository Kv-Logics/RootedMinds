"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Ghost, GitBranch, Database, GitCommit, ArrowRight, Layers, Fingerprint, Activity, CheckCircle, Clock, Server, Settings } from "lucide-react";
import type { Context } from "@/lib/api";
import AdvancedGraph from "@/components/AdvancedGraph";

const DEMO_FALLBACK_DATA = {
  incidentId: "INC-001-DEMO",
  trigger: "alert:billing-engine/latency-p99>5000ms",
  context: {
    confidence: 0.94,
    causal_chain: [
      { cause_id: "deploy:billing-engine:v1.2.0", effect_id: "metric:billing-engine:latency:1715000000", evidence: "Deploy v1.2.0 preceded latency anomaly", confidence: 0.88 },
      { cause_id: "metric:billing-engine:latency:1715000000", effect_id: "error:billing-engine:1715000100", evidence: "Latency breach triggered error rate threshold", confidence: 0.85 },
      { cause_id: "error:billing-engine:1715000100", effect_id: "INC-001-DEMO", evidence: "Incident triggered on service", confidence: 0.95 }
    ],
    similar_past_incidents: [
      { past_incident_id: "INC-PAYMENTS-OLD", similarity: 0.92, rationale: "92% behavioral match via Ghost Protocol — billing-engine was formerly payment-service (DNA fingerprint e0e6). Same error distribution, latency profile, and deploy pattern detected." }
    ],
    suggested_remediations: [
      { action: "rollback", target: "billing-engine", historical_outcome: "resolved", confidence: 0.91 }
    ],
    explain: "🚨 ROOT CAUSE DETECTED: deploy:billing-engine:v1.2.0\nThe service 'billing-engine' (DNA: a858) is experiencing a latency anomaly.\n🔍 IDENTITY REVEAL: This service was formerly known as 'payment-service' (Ghost Protocol match: 0.94)\n\n🧠 OPERATIONAL MEMORY: Found a 92% behavioral DNA match to past incident INC-PAYMENTS-OLD. The error distribution and latency spikes are nearly identical to previous failures.\n\n💡 RECOMMENDED ACTION: ROLLBACK on billing-engine. This fix has a resolved historical outcome with 0.91 confidence."
  }
};

export default function GraphAnalysisPage() {
  const searchParams = useSearchParams();
  const incidentId = searchParams.get("incidentId");
  
  const [data, setData] = useState<{ context: Context; incidentId: string; trigger: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentGraphContext");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error(e);
        setData(DEMO_FALLBACK_DATA as any);
      }
    } else {
      setData(DEMO_FALLBACK_DATA as any);
    }
  }, [incidentId]);

  if (!data) {
    return null;
  }

  const { context, trigger } = data;
  const topChain = context.causal_chain || [];
  const topMatch = context.similar_past_incidents?.[0];
  const hasGhost = topMatch?.rationale?.includes("Ghost Protocol") || context.explain?.includes("IDENTITY REVEAL");
  
  // Extract old service name from explanation if ghost
  let oldService = "unknown";
  if (hasGhost) {
    const match = context.explain?.match(/formerly known as '([^']+)'/);
    if (match) oldService = match[1];
    else if (topMatch?.rationale) {
        const words = topMatch.rationale.split(" ");
        // basic heuristic
        oldService = words[words.length -1].replace(/[^a-zA-Z0-9-]/g, '');
    }
  }

  const currentService = topChain.length > 0 ? topChain[0].cause_id : "service";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <GitBranch className="text-[#FF9933]" />
              Temporal Causal Graph
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <Fingerprint size={14}/>
              Analyzing DNA Signature for <span className="text-gray-300 font-mono">{data.incidentId}</span>
            </p>
          </div>
          
          <div className="bg-[#111] border border-gray-800 rounded-lg p-4 flex gap-8">
             <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Confidence Score</p>
                <p className="text-2xl font-bold font-mono text-[#FF9933]">{Math.round(context.confidence * 100)}%</p>
             </div>
             {hasGhost && (
                <div>
                   <p className="text-xs text-[#FF9933] uppercase tracking-widest font-bold">Ghost Protocol</p>
                   <p className="text-base font-bold text-white mt-1 flex items-center gap-2"><Ghost size={16}/> ACTIVE</p>
                </div>
             )}
          </div>
        </div>

        {/* Graph Area */}
        <div className="w-full h-[600px]">
           <AdvancedGraph 
             topChain={topChain} 
             oldService={oldService} 
             currentService={currentService} 
             hasGhost={hasGhost} 
           />
        </div>

        {/* Grid for Analysis Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DNA Fingerprint Breakdown (Hackathon Flex) */}
          <div className="bg-[#060b14] border border-blue-900/40 rounded-xl p-6 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 left-0 w-[3px] h-0 bg-blue-500 group-hover:h-full transition-all duration-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-5 flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-500" />
              DNA Matching Algorithm — Complete
            </h3>
            <div className="font-mono text-sm text-gray-400 space-y-3 leading-relaxed">
              <p className="text-gray-300 mb-3 font-sans text-base font-semibold">The 28 dimensions analyzed:</p>
              <div className="flex items-start gap-3"><Activity size={16} className="text-red-400 mt-0.5 flex-shrink-0" /><p><span className="text-red-400 font-bold">Dim 0-4:</span> Error rate, errors-per-deploy, error diversity, volume, rollback rate</p></div>
              <div className="flex items-start gap-3"><Clock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" /><p><span className="text-amber-400 font-bold">Dim 5-8:</span> Latency P50/P90/P95/P99 (normalized)</p></div>
              <div className="flex items-start gap-3"><Layers size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /><p><span className="text-blue-400 font-bold">Dim 9-12:</span> Event kind mix (deploy/log/metric/trace ratios)</p></div>
              <div className="flex items-start gap-3"><GitCommit size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" /><p><span className="text-emerald-400 font-bold">Dim 13-16:</span> Temporal incident patterns</p></div>
              <div className="flex items-start gap-3"><GitBranch size={16} className="text-orange-400 mt-0.5 flex-shrink-0" /><p><span className="text-orange-400 font-bold">Dim 17-20:</span> Deploy frequency and rollback ratio</p></div>
              <div className="flex items-start gap-3"><Database size={16} className="text-purple-400 mt-0.5 flex-shrink-0" /><p><span className="text-purple-400 font-bold">Dim 21-24:</span> Error message semantic buckets (connection/db/memory/auth)</p></div>
              <div className="flex items-start gap-3"><Settings size={16} className="text-gray-300 mt-0.5 flex-shrink-0" /><p><span className="text-gray-300 font-bold">Dim 25-27:</span> Remediation success rate</p></div>
            </div>
          </div>

          {/* Narrative Full Text */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 left-0 w-[3px] h-0 bg-[#FF9933] group-hover:h-full transition-all duration-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
              <Server size={16} />
              Complete Engine Narrative
            </h3>
            <div className="font-mono text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
              {context.explain}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
