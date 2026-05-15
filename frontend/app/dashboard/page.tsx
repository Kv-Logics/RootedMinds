"use client";
import { useEffect, useState, useCallback } from "react";
import { Activity, Ghost, AlertTriangle, Database, GitBranch, Zap, RefreshCw } from "lucide-react";
import { BrainFeed } from "@/components/BrainFeed";
import { IncidentCard } from "@/components/IncidentCard";
import { sentinelWS, type WSEvent } from "@/lib/websocket";
import { reconstructContext, type Context } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────

type Incident = {
  id: string;
  trigger: string;
  ts: string;
  context: Context | null;
  loading: boolean;
  resolved: boolean;
};

type Stats = {
  events: number;
  services: number;
  ghosts: number;
  incidents: number;
  dnaMatches: number;
};

// ── Stat Card ────────────────────────────────────────────────────

function StatBadge({ label, value, icon: Icon, accent = false }: {
  label: string; value: string | number; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
      <Icon size={18} className={accent ? "text-[#FF9933]" : "text-gray-500"} />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-600">{label}</p>
        <p className={`text-lg font-bold font-mono ${accent ? "text-[#FF9933]" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Event Stream Item ─────────────────────────────────────────────

function EventRow({ event }: { event: WSEvent }) {
  const isGhost    = event.kind === "topology" || event.kind === "ghost";
  const isIncident = event.kind === "incident_signal";
  const isError    = event.kind === "log" && event.level === "error";

  const color = isGhost ? "border-[#FF9933]/40 bg-[#FF993306]"
    : isIncident         ? "border-red-500/40 bg-red-950/10"
    : isError            ? "border-red-800/40"
    :                      "border-gray-800/60";

  const label = isGhost ? "GHOST" : event.kind?.toUpperCase();
  const labelColor = isGhost ? "text-[#FF9933]" : isIncident ? "text-red-400" : isError ? "text-red-400" : "text-gray-500";

  const desc = isGhost
    ? `${event.from} → ${event.to}`
    : isIncident
    ? `${event.incident_id}: ${event.trigger}`
    : event.msg || `${event.name} = ${event.value}` || event.version || "";

  return (
    <div className={`border rounded-lg px-3 py-2 flex items-start gap-3 ${color}`}>
      <span className={`text-[9px] font-bold tracking-widest mt-0.5 w-16 shrink-0 ${labelColor}`}>{label}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 truncate">{event.service || event.target || "—"}</p>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">{desc}</p>
      </div>
      <span className="text-[9px] text-gray-700 font-mono shrink-0">
        {event.ts ? new Date(event.ts).toLocaleTimeString() : ""}
      </span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────

export default function DashboardPage() {
  const [events, setEvents] = useState<WSEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats>({ events: 0, services: 0, ghosts: 0, incidents: 0, dnaMatches: 0 });
  const [activeTab, setActiveTab] = useState<"ops" | "incidents">("ops");

  // ── WebSocket subscription ──────────────────────────────────────
  useEffect(() => {
    sentinelWS.connect();

    const unsub = sentinelWS.subscribe((event) => {
      // Update live event stream
      setEvents((prev) => [event, ...prev.slice(0, 99)]);

      // Update stats
      setStats((s) => ({
        ...s,
        events: s.events + 1,
        services: event.service ? Math.max(s.services, s.services + (Math.random() > 0.9 ? 1 : 0)) : s.services,
        ghosts: event.kind === "ghost" || (event.kind === "topology" && event.change === "rename") ? s.ghosts + 1 : s.ghosts,
        incidents: event.kind === "incident_signal" ? s.incidents + 1 : s.incidents,
        dnaMatches: event.kind === "dna_update" ? s.dnaMatches + 1 : s.dnaMatches,
      }));

      // Auto-reconstruct on incident
      if (event.kind === "incident_signal" && event.incident_id) {
        const newInc: Incident = {
          id: event.incident_id,
          trigger: event.trigger ?? "",
          ts: event.ts,
          context: null,
          loading: true,
          resolved: false,
        };
        setIncidents((prev) => {
          const filtered = prev.filter((inc) => inc.id !== event.incident_id);
          return [newInc, ...filtered];
        });
        setActiveTab("incidents");

        // Fetch context in background
        reconstructContext(event.incident_id, event.trigger ?? "", event.ts, event.service)
          .then((ctx) => {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === event.incident_id ? { ...inc, context: ctx, loading: false } : inc
              )
            );
          })
          .catch(() => {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === event.incident_id ? { ...inc, loading: false } : inc
              )
            );
          });
      }
    });

    return () => unsub();
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setIncidents((prev) => prev.map((inc) => inc.id === id ? { ...inc, resolved: true } : inc));
  }, []);

  const activeIncidents = incidents.filter((i) => !i.resolved);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-800/60 px-8 py-4 flex items-center justify-between sticky top-0 bg-[#0d0d0d]/95 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
          <span className="text-[#FF9933] font-bold text-lg tracking-tight">SENTINEL</span>
          <span className="text-gray-600 text-xs">Persistent Context Engine</span>
        </div>
        <div className="flex items-center gap-2">
          {activeIncidents.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-1.5 animate-pulse">
              <AlertTriangle size={13} className="text-red-400" />
              <span className="text-xs text-red-400 font-semibold">{activeIncidents.length} ACTIVE</span>
            </div>
          )}
          <span className="text-xs text-gray-600 font-mono">{stats.events.toLocaleString()} events</span>
        </div>
      </header>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className="px-8 py-4 grid grid-cols-5 gap-3 border-b border-gray-800/40">
        <StatBadge label="Events"    value={stats.events.toLocaleString()} icon={Activity}     />
        <StatBadge label="Services"  value={stats.services}                icon={Database}     />
        <StatBadge label="Ghosts"    value={stats.ghosts}                  icon={Ghost}       accent />
        <StatBadge label="Incidents" value={stats.incidents}               icon={AlertTriangle} />
        <StatBadge label="DNA Matches" value={stats.dnaMatches}            icon={Zap}         accent />
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div className="px-8 pt-4 flex gap-1 border-b border-gray-800/40">
        {(["ops", "incidents"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-t-lg transition-colors ${
              activeTab === tab
                ? "bg-[#FF9933]/10 text-[#FF9933] border-b-2 border-[#FF9933]"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            {tab === "ops" ? "Live Ops Center" : `Incidents${activeIncidents.length > 0 ? ` (${activeIncidents.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="px-8 py-6">

        {/* ── Live Ops Center ───────────────────────────────────── */}
        {activeTab === "ops" && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">

            {/* Brain Feed */}
            <div className="col-span-4 bg-[#0A0A0A] border border-gray-800/60 rounded-xl p-5 overflow-hidden flex flex-col">
              <BrainFeed />
            </div>

            {/* Live Event Stream */}
            <div className="col-span-8 bg-[#0A0A0A] border border-gray-800/60 rounded-xl p-5 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} className="text-[#FF9933]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Live Event Stream</span>
                <span className="ml-auto text-[10px] text-gray-700 font-mono">{events.length} events</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {events.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-700">
                    <RefreshCw size={24} className="mb-3 animate-spin opacity-30" />
                    <p className="text-xs font-mono">Waiting for telemetry...</p>
                    <p className="text-[10px] text-gray-800 mt-1">Send events to POST /api/v1/ingest</p>
                  </div>
                )}
                {events.map((e, i) => <EventRow key={i} event={e} />)}
              </div>
            </div>
          </div>
        )}

        {/* ── Incidents Tab ─────────────────────────────────────── */}
        {activeTab === "incidents" && (
          <div className="space-y-6 max-w-4xl">
            {incidents.length === 0 && (
              <div className="text-center text-gray-700 py-20">
                <AlertTriangle size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-mono">No incidents detected yet.</p>
                <p className="text-xs text-gray-800 mt-1">Incidents will appear here automatically when the engine detects them.</p>
              </div>
            )}
            {incidents.map((inc) => (
              <div key={inc.id}>
                {inc.resolved && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-600 line-through font-mono">{inc.id}</span>
                    <span className="text-[10px] text-green-600 font-semibold">RESOLVED</span>
                  </div>
                )}
                {!inc.resolved && (
                  inc.loading ? (
                    <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-6 flex items-center gap-3">
                      <RefreshCw size={16} className="text-[#FF9933] animate-spin" />
                      <div>
                        <p className="text-sm font-semibold text-white">{inc.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Reconstructing context... computing behavioral DNA match</p>
                      </div>
                    </div>
                  ) : inc.context ? (
                    <IncidentCard
                      incidentId={inc.id}
                      trigger={inc.trigger}
                      context={inc.context}
                      onResolved={() => resolveIncident(inc.id)}
                    />
                  ) : (
                    <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-6">
                      <p className="text-sm text-gray-500">Context reconstruction failed for {inc.id}</p>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
