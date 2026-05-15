"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Database,
  Settings,
  Zap,
  ChevronRight,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",          icon: LayoutDashboard },
  { label: "AI Console", href: "/dashboard/ai",        icon: Bot },
  { label: "Data",       href: "/dashboard/data",      icon: Database },
  { label: "Activity",   href: "/dashboard/activity",  icon: Activity },
  { label: "Settings",   href: "/dashboard/settings",  icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/5 bg-dark-800/60 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sarvam-saffron to-sarvam-saffronDark flex items-center justify-center glow-brand">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Anvil</p>
            <p className="text-xs text-gray-500">Hackathon '26</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-3 mt-1">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn("nav-link", active && "active")}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {user && (
          <div className="px-3">
            <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
            <button
              onClick={logout}
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
        <div className="glass p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="dot-active" />
            <span className="text-xs text-gray-400">Backend connected</span>
          </div>
          <p className="text-xs text-gray-600">localhost:8000</p>
        </div>
      </div>
    </aside>
  );
}
