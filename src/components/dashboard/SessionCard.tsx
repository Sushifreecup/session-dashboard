import React from 'react';
import { Monitor, Laptop, Smartphone, Globe, ShieldAlert, Key, Clock, Download } from 'lucide-react';
import { SessionSnapshot } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionCardProps {
  session: SessionSnapshot;
  onViewSession: (session: SessionSnapshot) => void;
  onExport: (session: SessionSnapshot) => void;
}

export function SessionCard({ session, onViewSession, onExport }: SessionCardProps) {
  // Parse user agent to get OS and Browser
  const getDeviceInfo = (ua: string = '') => {
    let os = session.os || 'Unknown OS';
    let browser = 'Unknown Browser';
    
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    return { os, browser };
  };
  
  const deviceInfo = getDeviceInfo(session.user_agent);
  
  // Format date
  const capturedDate = new Date(session.captured_at);
  const timeAgo = formatDistanceToNow(capturedDate, { addSuffix: true, locale: es });
  const formattedDate = capturedDate.toLocaleString('es-ES', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
  });

  const isAuto = session.snapshot_type === 'periodic' || session.snapshot_type?.startsWith('navigation_');

  return (
    <div className="bg-[#12161F] border border-gray-800/60 rounded-xl p-5 hover:border-indigo-500/30 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <Monitor className="w-5 h-5" />
          <h3 className="font-bold text-gray-100">{session.pc_name || 'Dispositivo Desconocido'}</h3>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${isAuto ? 'bg-green-500/10 text-green-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
          {isAuto ? 'AUTO' : 'MANUAL'}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-4 line-clamp-2" title={session.user_agent}>
        {deviceInfo.os} • {deviceInfo.browser} ({session.user_agent?.substring(0, 50)}...)
      </p>
      
      <div className="flex flex-col gap-2 mb-6 mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Globe className="w-4 h-4 text-cyan-500" />
          <span>{session.ip_address || '0.0.0.0'} • {session.location_city || 'Unknown'}, {session.location_country || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-4 h-4 text-orange-400" />
          <span><strong className="text-gray-300">{timeAgo}</strong> ({formattedDate})</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Key className="w-4 h-4 text-yellow-500" />
          <span><strong className="text-gray-300">ID:</strong> {session.id.substring(0, 15)}...</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-auto">
        <button 
          onClick={() => onViewSession(session)}
          className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Ver Sesión &rarr;
        </button>
        <button 
          onClick={() => onExport(session)}
          className="col-span-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
