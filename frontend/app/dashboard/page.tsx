"use client";
import { useEffect, useState } from "react";
import { Users, Zap, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const CHART_DATA = [
  { time: "00:00", requests: 20, ai_calls: 5  },
  { time: "04:00", requests: 15, ai_calls: 3  },
  { time: "08:00", requests: 45, ai_calls: 18 },
  { time: "12:00", requests: 80, ai_calls: 32 },
  { time: "16:00", requests: 65, ai_calls: 25 },
  { time: "20:00", requests: 90, ai_calls: 40 },
  { time: "Now",   requests: 72, ai_calls: 30 },
];

const RECENT_ACTIVITY = [
  { label: "AI chat request processed",      time: "2s ago",  status: "success" },
  { label: "New item created via API",        time: "15s ago", status: "success" },
  { label: "Health check passed",             time: "1m ago",  status: "success" },
  { label: "Database query executed",         time: "3m ago",  status: "success" },
  { label: "Rate limit warning on /ai/chat",  time: "8m ago",  status: "warning" },
];

export default function DashboardPage() {
  const [uptime, setUptime] = useState<number | null>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    api.health.check()
      .then((r) => { setUptime(r.uptime_seconds); setBackendOk(true); })
      .catch(() => setBackendOk(false));
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={backendOk === null ? "badge-info" : backendOk ? "badge-success" : "badge-error"}>
            {backendOk === null ? "Checking..." : backendOk ? "Backend ✓" : "Backend ✗"}
          </span>
          {uptime !== null && (
            <span className="text-xs text-gray-500">
              Uptime: {Math.round(uptime)}s
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value="4,821"
          icon={<Activity className="w-4 h-4 text-brand-400" />}
          trend={{ value: 12, label: "today" }}
          accentColor="rgba(74, 90, 240, 0.6)"
        />
        <StatCard
          title="AI Calls"
          value="387"
          icon={<Zap className="w-4 h-4 text-purple-400" />}
          trend={{ value: 8, label: "today" }}
          accentColor="rgba(139, 92, 246, 0.6)"
        />
        <StatCard
          title="Active Users"
          value="142"
          icon={<Users className="w-4 h-4 text-cyan-400" />}
          trend={{ value: 5, label: "vs yesterday" }}
          accentColor="rgba(34, 211, 238, 0.6)"
        />
        <StatCard
          title="Success Rate"
          value="99.2%"
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          trend={{ value: 0.4, label: "this week" }}
          accentColor="rgba(52, 211, 153, 0.6)"
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Request Volume</h2>
            <span className="badge-info">Last 24h</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a5af0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4a5af0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="requests" stroke="#4a5af0" strokeWidth={2} fill="url(#gradReq)" name="Requests" />
              <Area type="monotone" dataKey="ai_calls"  stroke="#a78bfa" strokeWidth={2} fill="url(#gradAI)"  name="AI Calls"  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity */}
        <div className="glass p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.status === "success"
                      ? "bg-emerald-400"
                      : item.status === "warning"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">{item.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
