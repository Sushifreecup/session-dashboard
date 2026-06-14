import React from 'react';
import { Terminal, Copy, ExternalLink, ShieldAlert, Key, Database, Globe } from 'lucide-react';

interface InstructionGuideProps {
  platform: string;
  targetUrl: string;
  cookiesToLookFor: string[];
  localStorageKeys?: string[];
  sessionStorageKeys?: string[];
  icon: React.ReactNode;
  colorClass: string;
}

export function InstructionGuide({
  platform,
  targetUrl,
  cookiesToLookFor,
  localStorageKeys = [],
  sessionStorageKeys = [],
  icon,
  colorClass
}: InstructionGuideProps) {
  
  const copyScript = (type: 'cookie' | 'localStorage' | 'sessionStorage') => {
    let script = '';
    
    if (type === 'cookie') {
      script = `// Ejemplo para inyectar cookies manualmente en la consola:\n`;
      cookiesToLookFor.forEach(c => {
        script += `document.cookie = "${c}=PEGA_EL_VALOR_AQUI; path=/; domain=${new URL(targetUrl).hostname.replace('www', '')}";\n`;
      });
      script += `\n// NOTA: Es mucho más fácil y efectivo usar la extensión "EditThisCookie" para inyectar cookies.`;
    } else if (type === 'localStorage') {
      script = `// Pega esto en la consola (F12 -> Console) para inyectar LocalStorage:\n`;
      localStorageKeys.forEach(k => {
        script += `localStorage.setItem("${k}", "PEGA_EL_VALOR_AQUI");\n`;
      });
    } else if (type === 'sessionStorage') {
      script = `// Pega esto en la consola (F12 -> Console) para inyectar SessionStorage:\n`;
      sessionStorageKeys.forEach(k => {
        script += `sessionStorage.setItem("${k}", "PEGA_EL_VALOR_AQUI");\n`;
      });
    }

    navigator.clipboard.writeText(script);
    alert('Script copiado al portapapeles');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass.split(' ')[0]} bg-opacity-20`}>
          {React.cloneElement(icon as React.ReactElement, { className: \`w-6 h-6 \${colorClass.split(' ')[1]}\` })}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Inyectar Sesión: {platform}</h1>
          <p className="text-gray-400">Guía paso a paso para restaurar acceso a {platform}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h3 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Abrir URL Objetivo
          </h3>
          <p className="text-gray-400 mb-4 ml-8">Abre una pestaña en modo incógnito (recomendado) y navega a la página principal de {platform}.</p>
          <div className="ml-8 bg-[#080B10] border border-gray-800 rounded-lg p-4 flex justify-between items-center">
            <code className="text-indigo-400">{targetUrl}</code>
            <a href={targetUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <h3 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            Identificar Datos Clave
          </h3>
          <p className="text-gray-400 mb-4 ml-8">En el panel principal de Capturas, busca la sesión que quieres clonar, haz clic en "Ver Sesión" y busca los siguientes datos esenciales:</p>
          
          <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#080B10] border border-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-yellow-500" /> Cookies Necesarias
              </h4>
              <ul className="space-y-2">
                {cookiesToLookFor.map(c => (
                  <li key={c} className="text-xs font-mono text-gray-400 bg-[#12161F] px-2 py-1 rounded">{c}</li>
                ))}
              </ul>
            </div>

            {(localStorageKeys.length > 0 || sessionStorageKeys.length > 0) && (
              <div className="bg-[#080B10] border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> Storage Necesario
                </h4>
                <ul className="space-y-2">
                  {localStorageKeys.map(k => (
                    <li key={k} className="text-xs font-mono text-gray-400 bg-[#12161F] px-2 py-1 rounded border-l-2 border-blue-500">LS: {k}</li>
                  ))}
                  {sessionStorageKeys.map(k => (
                    <li key={k} className="text-xs font-mono text-gray-400 bg-[#12161F] px-2 py-1 rounded border-l-2 border-cyan-500">SS: {k}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h3 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
            <span className="bg-green-500/20 text-green-400 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
            Inyectar Datos
          </h3>
          <p className="text-gray-400 mb-4 ml-8">Instala la extensión "EditThisCookie" (o similar) para agregar las cookies. Para el Storage, presiona F12, ve a la pestaña Consola y ejecuta los comandos.</p>
          
          <div className="ml-8 space-y-3">
            <div className="flex items-center justify-between bg-[#080B10] border border-gray-800 rounded-lg p-3">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Globe className="w-4 h-4" /> Cookies (Vía Extensión)</span>
              <button onClick={() => copyScript('cookie')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                <Copy className="w-3 h-3" /> Copiar Script Helper
              </button>
            </div>
            
            {localStorageKeys.length > 0 && (
              <div className="flex items-center justify-between bg-[#080B10] border border-gray-800 rounded-lg p-3">
                <span className="text-sm text-gray-300 flex items-center gap-2"><Terminal className="w-4 h-4" /> Local Storage (Vía Consola)</span>
                <button onClick={() => copyScript('localStorage')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                  <Copy className="w-3 h-3" /> Copiar Comandos LS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-[#12161F] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <h3 className="text-lg font-bold text-gray-200 mb-2 flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
            Recargar la Página
          </h3>
          <p className="text-gray-400 ml-8">Una vez que hayas inyectado las cookies (y el Storage si aplica), presiona <strong>F5</strong> o recarga la página. Si los tokens son válidos y no han expirado, entrarás automáticamente a la sesión.</p>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 mt-8">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-1">Nota de Seguridad</h4>
            <p className="text-xs text-red-400/80">Algunas plataformas (como WhatsApp o Instagram) asocian la sesión al User-Agent o a la IP. Si te expulsan inmediatamente, asegúrate de que tu navegador tenga el mismo User-Agent que el dispositivo original (lo puedes ver en la tarjeta de la sesión).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
