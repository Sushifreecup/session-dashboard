'use client';

import React from 'react';
import { ExternalLink, ShieldAlert, Key, Database, ClipboardCopy, CheckCircle, Terminal } from 'lucide-react';

export interface PlatformStep {
  title: string;
  description: React.ReactNode;
  type: 'url' | 'cookies' | 'storage' | 'refresh' | 'warning' | 'info';
  data?: string[];
  url?: string;
  code?: string;
}

interface InstructionGuideProps {
  platform: string;
  targetUrl: string;
  domainFilter: string;
  icon: React.ReactNode;
  accentColor: string;
  steps: PlatformStep[];
  cookiesToLookFor: string[];
  localStorageKeys?: string[];
  sessionStorageKeys?: string[];
}

export function InstructionGuide({
  platform,
  targetUrl,
  domainFilter,
  icon,
  accentColor,
  steps,
  cookiesToLookFor,
  localStorageKeys = [],
  sessionStorageKeys = [],
}: InstructionGuideProps) {

  const stepColors: Record<PlatformStep['type'], string> = {
    url: '#6366f1',
    cookies: '#eab308',
    storage: '#3b82f6',
    refresh: '#22c55e',
    warning: '#ef4444',
    info: '#a855f7',
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 border border-gray-700">
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Inyectar Sesión: {platform}</h1>
          <p className="text-gray-400 text-sm">Guía exacta para acceder con los datos capturados</p>
        </div>
      </div>

      {/* What you need section */}
      <div className="bg-[#12161F] border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-yellow-500" /> Datos que necesitas de la sesión capturada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cookiesToLookFor.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Cookies clave</p>
              <div className="space-y-1">
                {cookiesToLookFor.map(c => (
                  <div key={c} className="text-xs font-mono text-yellow-300 bg-yellow-900/20 border border-yellow-800/30 px-2 py-1.5 rounded flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(localStorageKeys.length > 0 || sessionStorageKeys.length > 0) && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Storage clave</p>
              <div className="space-y-1">
                {localStorageKeys.map(k => (
                  <div key={k} className="text-xs font-mono text-blue-300 bg-blue-900/20 border border-blue-800/30 px-2 py-1.5 rounded flex items-center gap-2">
                    <span className="text-blue-500 text-[10px] font-bold">LS</span>
                    {k}
                  </div>
                ))}
                {sessionStorageKeys.map(k => (
                  <div key={k} className="text-xs font-mono text-cyan-300 bg-cyan-900/20 border border-cyan-800/30 px-2 py-1.5 rounded flex items-center gap-2">
                    <span className="text-cyan-500 text-[10px] font-bold">SS</span>
                    {k}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-[#12161F] border border-gray-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: stepColors[step.type] }}></div>
            <div className="ml-2">
              <h3 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0"
                  style={{ backgroundColor: stepColors[step.type] }}
                >
                  {step.type === 'warning' ? '!' : idx + 1}
                </span>
                {step.title}
              </h3>
              <div className="ml-8 text-sm text-gray-400">{step.description}</div>

              {step.url && (
                <div className="ml-8 mt-3 bg-[#080B10] border border-gray-800 rounded-lg p-3 flex justify-between items-center gap-3">
                  <code className="text-indigo-400 text-xs break-all">{step.url}</code>
                  <a href={step.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {step.data && step.data.length > 0 && (
                <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                  {step.data.map(d => (
                    <span key={d} className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded">{d}</span>
                  ))}
                </div>
              )}

              {step.code && (
                <div className="ml-8 mt-3 bg-black rounded-lg border border-gray-800 p-3 font-mono text-xs text-green-400 whitespace-pre-wrap">
                  {step.code}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
