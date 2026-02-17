const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// The problematic block is around lines 645-660
// We need to remove the extra </div> that closes the flex-col unexpectedly
// And ensure the WebStorage button is inside the flex-col

// Current state (approx):
// <div className="flex gap-5"> ... </div>
// {webStorage...}
// </div>  <-- EXTRA CLOSING DIV that closes "flex flex-col gap-5"
// </div>  <-- EXTRA CLOSING DIV potentially

// We will replace the entire block from "DISMISS" button to the end of that column
// To ensure structure is correct:
// <div className="flex flex-col gap-5">
//   <Restore Button>
//   <div className="flex gap-5"> <JSON> <Dismiss> </div>
//   {WebStorage Button}
// </div>

const badBlock = `                            <button onClick={() => setSelectedSession(null)} className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
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
                          )}
                          </div>
                        </div>
                      </div>`;

const goodBlock = `                            <button onClick={() => setSelectedSession(null)} className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
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
                          )}
                        </div>
                      </div>`;

// Note: I removed one </div> and the extra one I suspect exists
// Let's try to match a larger chunk to be safe

const startMarker = `className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
                              DISMISS
                            </button>`;

const endMarker = `<div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 shadow-inner">`;

const chunkRegex = /className="px-10 py-6 rounded-\[2rem\] glass[\s\S]*?bg-amber-500\/5/m;

const replacement = `className="px-10 py-6 rounded-[2rem] glass font-black text-white/30 text-sm uppercase tracking-widest border-white/10 hover:text-white/60 transition-colors">
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
                          )}
                        </div>
                      </div>
                      <div className="p-6 rounded-[2.5rem] bg-amber-500/5`;

content = content.replace(chunkRegex, replacement);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Fixed JSX structure');
