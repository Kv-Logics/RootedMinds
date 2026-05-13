"use client";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  accentColor = "rgba(74, 90, 240, 0.6)",
}: StatCardProps) {
  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <div
      className={cn("stat-card", className)}
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div
          className="p-2.5 rounded-lg"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              isPositive
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-red-400 bg-red-400/10"
            )}
          >
            {isPositive ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
