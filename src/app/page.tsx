import React from "react";
import GlassCard from "@/components/GlassCard";
import { Database, Users, Shield, Clock } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Total Sessions", value: "1,248", icon: Database, color: "text-blue-500" },
    { label: "Unique Users", value: "42", icon: Users, color: "text-purple-500" },
    { label: "Live Snapshots", value: "856", icon: Shield, color: "text-emerald-500" },
    { label: "Last Capture", value: "2m ago", icon: Clock, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-gray-400">Monitor and manage your captured sessions in real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={stat.label} delay={idx * 0.1} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard title="Recent Activity" className="lg:col-span-2" delay={0.4}>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Snapshot #{1000 + i}</p>
                    <p className="text-xs text-gray-500">User: user_429{i}  Captured at 2:0{i} PM</p>
                  </div>
                </div>
                <div className="glass-pill px-3 py-1 rounded-full text-xs font-medium text-emerald-400">Active</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard title="Quick Actions" delay={0.5}>
            <div className="grid gap-3">
              <button className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-semibold text-sm shadow-lg shadow-blue-500/20">Explore All Sessions</button>
              <button className="w-full py-3 px-4 rounded-xl glass hover:bg-white/10 transition-colors font-semibold text-sm">Export Database</button>
            </div>
          </GlassCard>

          <GlassCard title="System Status" delay={0.6}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Supabase Connection</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Storage Used</span>
                <span>1.2 GB / 5 GB</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full w-[24%]" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
