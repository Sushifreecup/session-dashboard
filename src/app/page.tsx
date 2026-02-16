"use client";

import React, { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Database, Users, Shield, Clock, ExternalLink, Facebook, Instagram, Twitter, MessageSquare, Play, Mail, Bot, Globe, AlertCircle, ShoppingCart, GraduationCap, Laptop, Cpu } from "lucide-react";
import Link from "next/link";
import { supabase, SessionSnapshot } from "@/lib/supabase";

const platformConfig: Record<string, { icon: any; color: string }> = {
  Facebook: { icon: Facebook, color: "text-blue-500" },
  Instagram: { icon: Instagram, color: "text-pink-500" },
  YouTube: { icon: Play, color: "text-red-500" },
  Grok: { icon: Bot, color: "text-purple-400" },
  ChatGPT: { icon: MessageSquare, color: "text-emerald-400" },
  LinkedIn: { icon: Globe, color: "text-blue-600" },
  Blackboard: { icon: GraduationCap, color: "text-blue-400" },
  Google: { icon: Globe, color: "text-red-400" },
  Kick: { icon: Play, color: "text-green-500" },
  Netflix: { icon: Play, color: "text-red-600" },
  Standard: { icon: Shield, color: "text-blue-400" }
};

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
  const [recentActivity, setRecentActivity] = useState<SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Total Sessions
      const { count: sessionCount } = await supabase.from("session_snapshots").select("*", { count: "exact", head: true });
      
      // 2. Fetch Recent Activity
      const { data: recentSnapshots } = await supabase
        .from("session_snapshots")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(5);

      if (recentSnapshots && recentSnapshots.length > 0) {
        setRecentActivity(recentSnapshots);
        
        // 3. Unique Users (approximated from snapshots)
        const { data: userData } = await supabase.from("session_snapshots").select("user_id");
        const uniqueUsers = new Set(userData?.map(u => u.user_id)).size;

        // 4. Update Stats
        const lastCapture = recentSnapshots[0].captured_at;
        setStats([
          { label: "Total Sessions", value: sessionCount?.toLocaleString() || "0", icon: Database, color: "text-blue-500" },
          { label: "Unique Users", value: uniqueUsers.toLocaleString(), icon: Users, color: "text-purple-500" },
          { label: "Live Snapshots", value: sessionCount?.toLocaleString() || "0", icon: Shield, color: "text-emerald-500" },
          { label: "Last Capture", value: formatRelativeTime(lastCapture), icon: Clock, color: "text-amber-500" },
        ]);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-white/90">System Overview</h2>
        <p className="text-gray-500 font-medium tracking-wide uppercase text-xs">Aesthetix Intelligence & Real-Time Monitoring</p>
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
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Recent Neural Activity</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
               [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse" />)
            ) : recentActivity.length > 0 ? (
              recentActivity.map((session, idx) => (
                <Link 
                  key={session.id} 
                  href="/sessions"
                  className="flex items-center justify-between p-7 hover:bg-white/[0.03] transition-all group border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-black text-white/90 text-lg">Snapshot #{session.id.slice(0, 4).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                        PLATFORM: {session.snapshot_type.toUpperCase()} | CAPTURED {formatRelativeTime(session.captured_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                      USER: {session.user_id.slice(0, 8)}
                    </div>
                    <ExternalLink size={18} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
                <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No activity detected on local node.</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard delay={0.5} className="p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-6">Operations Hub</h3>
            <div className="grid gap-4">
              <Link 
                href="/sessions"
                className="flex items-center justify-center w-full py-5 px-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 transition-all font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-blue-500/20 active:scale-95"
              >
                Access Archives
              </Link>
              <button className="w-full py-5 px-6 rounded-[1.5rem] glass hover:bg-white/10 transition-colors font-black text-xs uppercase tracking-widest text-white/60 border border-white/5">
                Export DB
              </button>
            </div>
          </GlassCard>

          <GlassCard delay={0.6} className="p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-6">Nexus Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[11px] font-black tracking-widest">
                <span className="text-gray-500 uppercase">Supabase Link</span>
                <span className="text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  SYNCHRONIZED
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
