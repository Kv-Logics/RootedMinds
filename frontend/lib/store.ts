import { create } from "zustand";
import { type WSEvent } from "./websocket";
import { type Context } from "./api";

export type Incident = {
  id: string;
  trigger: string;
  ts: string;
  context: Context | null;
  loading: boolean;
  resolved: boolean;
};

export type Stats = {
  events: number;
  services: number;
  ghosts: number;
  incidents: number;
  dnaMatches: number;
};

interface DashboardStore {
  events: WSEvent[];
  incidents: Incident[];
  stats: Stats;
  activeTab: "ops" | "incidents";
  isSubscribed: boolean;

  addEvent: (event: WSEvent) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, partial: Partial<Incident>) => void;
  resolveIncident: (id: string) => void;
  setActiveTab: (tab: "ops" | "incidents") => void;
  setSubscribed: (val: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  events: [],
  incidents: [],
  stats: { events: 0, services: 0, ghosts: 0, incidents: 0, dnaMatches: 0 },
  activeTab: "ops",
  isSubscribed: false,

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events.slice(0, 99)],
    stats: {
      ...state.stats,
      events: state.stats.events + 1,
      services: event.service ? Math.max(state.stats.services, state.stats.services + (Math.random() > 0.9 ? 1 : 0)) : state.stats.services,
      ghosts: event.kind === "ghost" || (event.kind === "topology" && event.change === "rename") ? state.stats.ghosts + 1 : state.stats.ghosts,
      incidents: event.kind === "incident_signal" ? state.stats.incidents + 1 : state.stats.incidents,
      dnaMatches: event.kind === "dna_update" ? state.stats.dnaMatches + 1 : state.stats.dnaMatches,
    }
  })),

  addIncident: (incident) => set((state) => {
    const filtered = state.incidents.filter((inc) => inc.id !== incident.id);
    return {
      incidents: [incident, ...filtered],
      activeTab: "incidents" // Auto-switch tab on new incident
    };
  }),

  updateIncident: (id, partial) => set((state) => ({
    incidents: state.incidents.map(inc => inc.id === id ? { ...inc, ...partial } : inc)
  })),

  resolveIncident: (id) => set((state) => ({
    incidents: state.incidents.map((inc) => inc.id === id ? { ...inc, resolved: true } : inc)
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubscribed: (val) => set({ isSubscribed: val })
}));
