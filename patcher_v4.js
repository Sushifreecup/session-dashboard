const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// 1. Add state for AU copied
if (!content.includes('const [copiedUA, setCopiedUA] = useState(false);')) {
    content = content.replace('const [copiedJson, setCopiedJson] = useState(false);', 
        'const [copiedJson, setCopiedJson] = useState(false);\n  const [copiedUA, setCopiedUA] = useState(false);');
}

// 2. Update Manual Steps in the Guide
const oldGuide = `                  {[
                    { step: "01", title: "Emulate Environment", desc: "Copy the original User-Agent and apply it using 'User-Agent Switcher' extension." },
                    { step: "02", title: "Target Domain", desc: "Navigate to the site (e.g., instagram.com) to establish the context." },
                    { step: "03", title: "Deep Injection", desc: "Use the 'JSON Method' with 'Cookie-Editor' for full HttpOnly bypass." },
                    { step: "04", title: "Execute Restoration", desc: "Refresh the page. If the session persists, you have successfully mirrored the ID." }
                  ].map((item, idx) => (`;

const newGuide = `                  {[
                    { step: "01", title: "Match User-Agent", desc: "Use 'User-Agent Switcher' extension. Paste the exact UA captured in the panel." },
                    { step: "02", title: "Clean Start", desc: "Open a new tab at the target site (e.g., instagram.com) BEFORE importing." },
                    { step: "03", title: "Import Clone", desc: "In Cookie-Editor, use 'Import' and paste the Safe JSON. Click 'Import' again." },
                    { step: "04", title: "Persistence", desc: "Refresh the page. The session should be recognized as a local 1:1 mirror." }
                  ].map((item, idx) => (`;

content = content.replace(oldGuide, newGuide);

// 3. Add Copy UA button in the Detail View
const uaSearch = `<div className="text-[10px] font-black text-emerald-400">MATCH VALIDATED</div>}`;
const uaButton = `<div className="text-[10px] font-black text-emerald-400">MATCH VALIDATED</div>}
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedSession.user_agent || "");
                                    setCopiedUA(true);
                                    setTimeout(() => setCopiedUA(false), 3000);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2 group border border-blue-500/20"
                            >
                                {copiedUA ? <Check size={12} /> : <Copy size={12} />}
                                {copiedUA ? "COPIED" : "COPY UA"}
                            </button>`;

if (!content.includes('setCopiedUA(true)')) {
    content = content.replace(uaSearch, uaButton);
}

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
