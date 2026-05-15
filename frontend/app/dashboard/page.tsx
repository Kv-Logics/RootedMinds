"use client";
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Ghost, Terminal } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#131313] text-white p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-[#FF9933]">SENTINEL</h1>
          <p className="text-gray-400 text-sm">Persistent Context Engine for AI SRE</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1A1A1A] px-4 py-2 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-500 block">EVENTS INGESTED</span>
            <span className="text-xl font-mono text-[#FF9933]">1,248</span>
          </div>
          <div className="bg-[#1A1A1A] px-4 py-2 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-500 block">DNA MATCHES</span>
            <span className="text-xl font-mono text-green-500">12</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Brain Activity */}
        <div className="col-span-4 bg-[#0A0A0A] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-[#FF9933]" />
            <h2 className="font-semibold text-lg uppercase tracking-widest text-xs">Brain Activity</h2>
          </div>
          <div className="space-y-4">
            <ActivityItem time="14:22:01" msg="DNA fingerprint updated" svc="payments-svc" />
            <ActivityItem time="14:22:03" msg="Anomaly detected (3.2σ)" svc="payments-svc" type="warning" />
            <ActivityItem time="14:22:08" msg="GHOST PROTOCOL ACTIVE" svc="billing-svc" type="ghost" />
          </div>
        </div>

        {/* Center: Live Graph Placeholder */}
        <div className="col-span-8 bg-[#0A0A0A] rounded-xl border border-gray-800 p-6 min-h-[400px] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF9933_1px,transparent_1px)] [background-size:20px_20px]"></div>
             <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">Causal Graph Surface</p>
        </div>

      </div>
    </div>
  );
}

function ActivityItem({ time, msg, svc, type = 'info' }: any) {
  const colors: any = {
    info: 'text-[#FF9933]',
    warning: 'text-amber-500',
    ghost: 'text-purple-400'
  };
  
  return (
    <div className="border-l-2 border-gray-800 pl-4 py-1">
      <span className="text-[10px] text-gray-600 block">{time}</span>
      <p className="text-sm font-medium">
        <span className={colors[type]}>{msg}</span>
      </p>
      <p className="text-[10px] text-gray-500 font-mono">{svc}</p>
    </div>
  );
}
