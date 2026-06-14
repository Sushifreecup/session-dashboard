'use client';

import React from 'react';
import { Terminal, Copy, ExternalLink, ShieldAlert, Key, Database, Globe } from 'lucide-react';

interface InstructionGuideProps {
  platform: string;
  targetUrl: string;
  cookiesToLookFor: string[];
  localStorageKeys?: string[];
  sessionStorageKeys?: string[];
  icon: React.ReactNode;
  accentColor: string;
}

export function InstructionGuide({
  platform,
  targetUrl,
  cookiesToLookFor,
  localStorageKeys = [],
  sessionStorageKeys = [],
  icon,
  accentColor,
}: InstructionGuideProps) {

  const copyScript = (type: 'cookie' | 'localStorage' | 'sessionStorage') => {
    let script = '';
    const hostname = new URL(targetUrl).hostname.replace('www.', '');

    if (type === 'cookie') {
      script = '// Pega esto en la consola del navegador (F12 -> Console):\n';
      cookiesToLookFor.forEach(c => {
        script += `document.cookie = "${c}=PEGA_EL_VALOR_AQUI; path=/; domain=.${hostname}";\n`;
      });
      script += '\n// TIP: Es más fácil usar la extensión "EditThisCookie" para inyectar cookies visualmente.';
    } else if (type === 'localStorage') {
      script = '// Pega esto en la consola del navegador (F12 -> Console) para inyectar LocalStorage:\n';
      localStorageKeys.forEach(k => {
        script += `localStorage.setItem("${k}", "PEGA_EL_VALOR_AQUI");\n`;
      });
    } else if (type === 'sessionStorage') {
      script = '// Pega esto en la consola del navegador (F12 -> Console) para inyectar SessionStorage:\n';
      sessionStorageKeys.forEach(k => {
        script += `sessionStorage.setItem("${k}", "PEGA_EL_VALOR_AQUI");\n`;
      });
    }

    navigator.clipboard.writeText(script).then(() => {
      alert('Script copiado al portapapeles. Pégalo en la consola (F12) del navegador.');
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 border border-gray-700">
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Inyectar Sesión: {platform}</h1>
          <p className="text-gray-400">Guía paso a paso para restaurar acceso a {platform}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Step 1 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accentColor }}></div>
          <h3 className="text-base font-bold text-gray-200 mb-2 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: accentColor }}>1</span>
            Abrir URL Objetivo
          </h3>
          <p className="text-gray-400 mb-4 ml-9">Abre una pestaña en modo incógnito y navega a la página principal de {platform}.</p>
          <div className="ml-9 bg-[#080B10] border border-gray-800 rounded-lg p-4 flex justify-between items-center gap-4">
            <code className="text-indigo-400 text-sm break-all">{targetUrl}</code>
            <a href={targetUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <h3 className="text-base font-bold text-gray-200 mb-2 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">2</span>
            Identificar los Datos Clave en la Sesión
          </h3>
          <p className="text-gray-400 mb-4 ml-9">
            Vuelve a la página principal (Capturas), haz clic en <strong className="text-white">Ver Sesión →</strong> en la tarjeta que deseas clonar y localiza los siguientes datos:
          </p>

          <div className="ml-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cookiesToLookFor.length > 0 && (
              <div className="bg-[#080B10] border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-500" /> Cookies Requeridas
                </h4>
                <ul className="space-y-1.5">
                  {cookiesToLookFor.map(c => (
                    <li key={c} className="text-xs font-mono text-yellow-300 bg-yellow-900/20 border border-yellow-800/30 px-2 py-1 rounded">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {(localStorageKeys.length > 0 || sessionStorageKeys.length > 0) && (
              <div className="bg-[#080B10] border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> Storage Requerido
                </h4>
                <ul className="space-y-1.5">
                  {localStorageKeys.map(k => (
                    <li key={k} className="text-xs font-mono text-blue-300 bg-blue-900/20 border border-blue-800/30 px-2 py-1 rounded">
                      <span className="text-blue-500 mr-1">LS:</span>{k}
                    </li>
                  ))}
                  {sessionStorageKeys.map(k => (
                    <li key={k} className="text-xs font-mono text-cyan-300 bg-cyan-900/20 border border-cyan-800/30 px-2 py-1 rounded">
                      <span className="text-cyan-500 mr-1">SS:</span>{k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h3 className="text-base font-bold text-gray-200 mb-2 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs text-white font-bold">3</span>
            Inyectar los Datos
          </h3>
          <p className="text-gray-400 mb-4 ml-9">
            Para las Cookies: instala <strong className="text-white">EditThisCookie</strong> (extensión de Chrome) e importa cada valor manualmente.
            Para el Storage: abre la consola F12 en la URL objetivo y pega los comandos.
          </p>

          <div className="ml-9 space-y-2">
            {cookiesToLookFor.length > 0 && (
              <div className="flex items-center justify-between bg-[#080B10] border border-gray-800 rounded-lg p-3">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" /> Cookies — vía EditThisCookie
                </span>
                <button onClick={() => copyScript('cookie')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                  <Copy className="w-3 h-3" /> Copiar script
                </button>
              </div>
            )}

            {localStorageKeys.length > 0 && (
              <div className="flex items-center justify-between bg-[#080B10] border border-gray-800 rounded-lg p-3">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" /> LocalStorage — vía consola F12
                </span>
                <button onClick={() => copyScript('localStorage')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                  <Copy className="w-3 h-3" /> Copiar comandos
                </button>
              </div>
            )}

            {sessionStorageKeys.length > 0 && (
              <div className="flex items-center justify-between bg-[#080B10] border border-gray-800 rounded-lg p-3">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> SessionStorage — vía consola F12
                </span>
                <button onClick={() => copyScript('sessionStorage')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
                  <Copy className="w-3 h-3" /> Copiar comandos SS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <h3 className="text-base font-bold text-gray-200 mb-2 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-xs text-white font-bold">4</span>
            Recargar la Página
          </h3>
          <p className="text-gray-400 ml-9">
            Una vez inyectados todos los datos, presiona <strong className="text-white">F5</strong> para recargar. Si los tokens son válidos, entrarás automáticamente a la sesión sin necesidad de contraseña.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 flex gap-3 mt-6">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-1">Nota Importante</h4>
            <p className="text-xs text-red-300/80">
              Algunas plataformas como WhatsApp e Instagram asocian la sesión al User-Agent o la IP de origen. 
              Si la sesión no funciona, intenta replicar el User-Agent del dispositivo original. 
              Puedes verlo en la tarjeta de la captura bajo el nombre del PC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
