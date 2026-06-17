'use client';

import Link from 'next/link';
import { Zap, Monitor, MessageCircle, Instagram, Music2, Mail, HardDrive, Trash2, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const handleClearDB = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar toda la base de datos? Esto eliminará TODAS las sesiones y cookies capturadas.')) {
      try {
        const { error } = await supabase.from('session_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        alert('Base de datos limpiada correctamente.');
        window.location.href = '/';
      } catch (error) {
        console.error('Error clearing DB:', error);
        alert('Error al limpiar la base de datos.');
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string, color: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
      active 
        ? `border-${color}-500 bg-${color}-500/10 text-white` 
        : `border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-${color}-500/50`
    }`;
  };

  return (
    <div className="w-64 bg-[#080B10] border-r border-gray-800/50 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          EduSync
        </h1>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</p>
        </div>
        <Link href="/" className={linkClass('/', 'indigo')}>
          <Monitor className="w-4 h-4 text-indigo-400" />
          Capturas
        </Link>

        <div className="px-4 mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutoriales</p>
        </div>
        <Link href="/instructions/blackboard" className={linkClass('/instructions/blackboard', 'purple')}>
          <GraduationCap className="w-4 h-4 text-purple-400" />
          Blackboard
        </Link>
        <Link href="/instructions/whatsapp" className={linkClass('/instructions/whatsapp', 'green')}>
          <MessageCircle className="w-4 h-4 text-green-400" />
          WhatsApp
        </Link>
        <Link href="/instructions/instagram" className={linkClass('/instructions/instagram', 'pink')}>
          <Instagram className="w-4 h-4 text-pink-400" />
          Instagram
        </Link>
        <Link href="/instructions/tiktok" className={linkClass('/instructions/tiktok', 'cyan')}>
          <Music2 className="w-4 h-4 text-cyan-400" />
          TikTok
        </Link>
        <Link href="/instructions/gmail" className={linkClass('/instructions/gmail', 'red')}>
          <Mail className="w-4 h-4 text-red-400" />
          Gmail
        </Link>
        <Link href="/instructions/drive" className={linkClass('/instructions/drive', 'blue')}>
          <HardDrive className="w-4 h-4 text-blue-400" />
          Drive
        </Link>
      </div>

      <div className="p-4 border-t border-gray-800/50 mt-auto">
        <button 
          onClick={handleClearDB}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar Base de Datos
        </button>
      </div>
    </div>
  );
}
