"use client";
import { useEffect, useRef, useState } from "react";
import { sentinelWS, type WSEvent } from "@/lib/websocket";
import { Activity, Ghost, AlertTriangle, Zap, GitBranch, BarChart2 } from "lucide-react";

type FeedItem = WSEvent & { id: string };

const KIND_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  deploy:          { icon: GitBranch,    color: "text-blue-400",   label: "DEPLOY"   },
  log:             { icon: AlertTriangle, color: "text-red-400",    label: "ERROR"    },
  metric:          { icon: BarChart2,    color: "text-amber-400",  label: "METRIC"   },
  incident_signal: { icon: Zap,          color: "text-red-500",    label: "INCIDENT" },
  topology:        { icon: Ghost,        color: "text-purple-400", label: "TOPOLOGY" },
  ghost:           { icon: Ghost,        color: "text-[#FF9933]",  label: "GHOST"    },
  dna_update:      { icon: Activity,     color: "text-[#FF9933]",  label: "DNA"      },
  remediation:     { icon: Zap,          color: "text-green-400",  label: "FIX"      },
};

function formatMsg(event: WSEvent): string {
  switch (event.kind) {
    case "deploy":   return `${event.service} → ${event.version}`;
    case "log":      return event.msg?.slice(0, 60) ?? "error log";
    case "metric":   return `${event.service} ${event.name} = ${event.value}`;
    case "incident_signal": return `${event.incident_id}: ${event.trigger}`;
    case "topology": return `${event.from} → ${event.to} (rename)`;
    case "ghost":    return `Ghost Protocol: ${event.from} ≡ ${event.to} (${Math.round((event.similarity ?? 0) * 100)}%)`;
    case "remediation": return `${event.action} ${event.target} → ${event.outcome ?? "pending"}`;
    default:         return JSON.stringify(event).slice(0, 60);
  }
}

export function BrainFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sentinelWS.connect();
    const unsub = sentinelWS.subscribe((event) => {
      setConnected(true);
      setItems((prev) => [
        { ...event, id: `${Date.now()}-${Math.random()}` },
        ...prev.slice(0, 49), // keep last 50 items
      ]);
    });
    return () => { unsub(); };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#FF9933]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Brain Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
          <span className="text-[10px] text-gray-500">{connected ? "LIVE" : "CONNECTING..."}</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
        {items.length === 0 && (
          <div className="text-center text-gray-700 text-xs py-8 font-mono">
            Waiting for events...
          </div>
        )}
        {items.map((item) => {
          const cfg = KIND_CONFIG[item.kind] ?? KIND_CONFIG.log;
          const Icon = cfg.icon;
          const isGhost = item.kind === "ghost" || item.kind === "topology";
          const isIncident = item.kind === "incident_signal";
          return (
            <div
              key={item.id}
              className={`border-l-2 pl-3 py-1.5 rounded-r ${
                isGhost    ? "border-[#FF9933] bg-[#FF993308]" :
                isIncident ? "border-red-500 bg-red-950/20"    :
                             "border-gray-800"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={11} className={cfg.color} />
                <span className={`text-[10px] font-bold tracking-wider ${cfg.color}`}>{cfg.label}</span>
                <span className="text-[10px] text-gray-600 ml-auto font-mono">
                  {item.ts ? new Date(item.ts).toLocaleTimeString() : ""}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-snug">{formatMsg(item)}</p>
              {item.service && (
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{item.service}</p>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
