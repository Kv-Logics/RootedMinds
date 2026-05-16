"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  ChevronRight,
  LogOut,
  Activity,
  Cpu,
  Zap,
  Brain,
  Ghost as GhostIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/dashboard",        icon: LayoutDashboard },
  { label: "Graph Analysis", href: "/dashboard/graph",  icon: Share2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/5 bg-[#080808]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9933] to-[#FF6600] flex items-center justify-center shadow-[0_0_15px_rgba(255,153,51,0.3)]">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-widest uppercase">Sentinel</p>
            <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Identity Engine</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] px-3 mb-4 mt-2 font-bold">
          Core Systems
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm",
                active 
                  ? "bg-[#FF993310] text-[#FF9933] border border-[#FF993320] shadow-[inset_0_0_10px_rgba(255,153,51,0.05)]" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-[#FF9933]" : "text-gray-600")} />
              <span className="flex-1 font-medium">{item.label}</span>
              {active && <div className="w-1 h-1 bg-[#FF9933] rounded-full shadow-[0_0_8px_#FF9933]" />}
            </Link>
          );
        })}

        {/* Engine Status (Cyberpunk Flex) */}
        <div className="mt-10 px-3 space-y-6">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em] mb-4 font-bold">Neural Engine</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Cohesion</span>
                  <span className="text-emerald-400">98.2%</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '98%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-500">Identity Match</span>
                  <span className="text-[#FF9933]">Active</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-800/50">
                  <div className="h-full bg-[#FF9933]" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 group hover:border-violet-500/30 transition-colors cursor-default">
              <GhostIcon className="w-4 h-4 text-violet-400 animate-pulse" />
              <div>
                <p className="text-[10px] text-violet-300 font-bold uppercase tracking-tighter">Ghost Protocol</p>
                <p className="text-[9px] text-gray-500 font-mono">STANDBY_READY</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User & Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {user && (
          <div className="px-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                {user.email[0].toUpperCase()}
              </div>
              <p className="text-xs text-gray-400 truncate flex-1">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-red-400 transition-colors w-full px-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminate Session</span>
            </button>
          </div>
        )}
        
        <div className="bg-[#0f0f0f] border border-gray-800/50 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
             <span className="text-[10px] text-gray-500 font-mono">NODE_01</span>
          </div>
          <span className="text-[9px] text-gray-700 font-mono">v1.2.0-STABLE</span>
        </div>
      </div>
    </aside>
  );
}
