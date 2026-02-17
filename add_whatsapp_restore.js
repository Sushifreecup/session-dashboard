const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// =====================================================================
// 1. Add webStorage state + copiedStorage state (after copiedUA state)
// =====================================================================
content = content.replace(
  'const [showGuide, setShowGuide] = useState(false);',
  `const [showGuide, setShowGuide] = useState(false);
  const [webStorage, setWebStorage] = useState<any[]>([]);
  const [copiedStorage, setCopiedStorage] = useState(false);`
);

// =====================================================================
// 2. Add fetchWebStorage function (after fetchCookies function)
// =====================================================================
content = content.replace(
  '  const handleSessionClick = (session: SessionSnapshot) => {',
  `  const fetchWebStorage = async (snapshotId: string) => {
    const { data } = await supabase
      .from("web_storage")
      .select("*")
      .eq("snapshot_id", snapshotId)
      .limit(5000);
    if (data) setWebStorage(data);
    else setWebStorage([]);
  };

  const generateWhatsAppScript = () => {
    if (webStorage.length === 0) return "";
    
    // Separate IndexedDB and LocalStorage entries
    const idbEntries = webStorage.filter(e => e.storage_type === 'indexeddb');
    const lsEntries = webStorage.filter(e => e.storage_type === 'localstorage');
    
    // Group IDB entries by db_name -> store_name
    const dbMap: Record<string, Record<string, {key: string, value: string}[]>> = {};
    idbEntries.forEach(e => {
      if (!dbMap[e.db_name]) dbMap[e.db_name] = {};
      if (!dbMap[e.db_name][e.store_name]) dbMap[e.db_name][e.store_name] = [];
      dbMap[e.db_name][e.store_name].push({ key: e.key, value: e.value });
    });
    
    return \`(async function() {
  console.clear();
  console.log('%c [WhatsApp Restore] INICIANDO RESTAURACIÓN PROFUNDA ', 'background: #25D366; color: #fff; font-weight: bold; padding: 8px; border-radius: 4px; font-size: 16px;');
  
  // STEP 1: Restore LocalStorage
  const lsData = \${JSON.stringify(lsEntries.map(e => ({ key: e.key, value: e.value })))};
  console.log('%c [LS] Restaurando ' + lsData.length + ' entradas de LocalStorage...', 'color: #25D366;');
  lsData.forEach(e => {
    try { localStorage.setItem(e.key, e.value); } catch(err) { console.warn('LS skip:', e.key); }
  });
  console.log('%c [LS]  LocalStorage restaurado', 'color: #25D366; font-weight: bold;');
  
  // STEP 2: Restore IndexedDB databases
  const dbMap = \${JSON.stringify(dbMap)};
  for (const [dbName, stores] of Object.entries(dbMap)) {
    console.log('%c [IDB] Restaurando DB: ' + dbName, 'color: #00BCD4;');
    try {
      // Delete existing DB first for clean restore
      await new Promise((resolve, reject) => {
        const delReq = indexedDB.deleteDatabase(dbName);
        delReq.onsuccess = resolve;
        delReq.onerror = resolve; // Continue even if delete fails
        delReq.onblocked = resolve;
      });
      
      const storeNames = Object.keys(stores);
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          storeNames.forEach(name => {
            if (!db.objectStoreNames.contains(name)) {
              db.createObjectStore(name);
            }
          });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
      });
      
      for (const [storeName, entries] of Object.entries(stores)) {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          for (const entry of entries) {
            try {
              const val = entry.value && entry.value.startsWith('{') || entry.value.startsWith('[') ? JSON.parse(entry.value) : entry.value;
              store.put(val, entry.key);
            } catch(e) {
              store.put(entry.value, entry.key);
            }
          }
          await new Promise(r => { tx.oncomplete = r; tx.onerror = r; });
          console.log('   ' + storeName + ': ' + entries.length + ' entradas');
        } catch(e) { console.warn('   Store skip:', storeName, e.message); }
      }
      db.close();
    } catch(e) { console.warn(' DB skip:', dbName, e.message); }
  }
  
  console.log('%c [WhatsApp Restore]  RESTAURACIÓN COMPLETA - Recarga la página (F5)', 'background: #25D366; color: #fff; font-weight: bold; padding: 8px; border-radius: 4px; font-size: 16px;');
})()\`;
  };

  const copyWhatsAppScript = () => {
    const script = generateWhatsAppScript();
    if (!script) return;
    navigator.clipboard.writeText(script).then(() => {
      setCopiedStorage(true);
      setTimeout(() => setCopiedStorage(false), 5000);
    });
  };

  const handleSessionClick = (session: SessionSnapshot) => {`
);

// =====================================================================
// 3. Add fetchWebStorage call inside handleSessionClick  
// =====================================================================
content = content.replace(
  `    fetchCookies(session.id);
  };

  const generateConsoleScript`,
  `    fetchCookies(session.id);
    fetchWebStorage(session.id);
  };

  const generateConsoleScript`
);

// =====================================================================
// 4. Add WhatsApp restoration button in the detail panel
// After the COPIAR JSON button and before DISMISS
// =====================================================================
content = content.replace(
  `                            <button onClick={() => setSelectedSession(null)} className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
                              DISMISS
                            </button>`,
  `                            <button onClick={() => setSelectedSession(null)} className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
                              DISMISS
                            </button>
                          </div>
                          {webStorage.length > 0 && (
                            <button 
                              onClick={copyWhatsAppScript}
                              className={"w-full flex items-center justify-center gap-4 p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all " + (copiedStorage ? "bg-green-600 text-white shadow-green-500/40 shadow-2xl" : "bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 shadow-2xl")}
                            >
                              {copiedStorage ? <><Check size={24} /> SCRIPT COPIADO</> : <><Download size={24} /> RESTORE DEEP STORAGE ({webStorage.length} entries)</>}
                            </button>
                          )}`
);

// Fix: remove the extra closing </div> that we introduced
// The original structure was: <div className="flex gap-5"> ... DISMISS </div>
// We need to make sure our new button is OUTSIDE that flex div but inside the parent

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Patched successfully');
