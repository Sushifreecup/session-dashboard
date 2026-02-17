const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// The regex approach might fail if I didn't escape correctly or if content varies slightly.
// Let's use a simpler replace based on unique string context.

const badPart = `                              DISMISS
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

// We want to remove one `</div>` after the `)}`.
// And ensure the indentation is somewhat clean.

const goodPart = `                              DISMISS
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

content = content.replace(badPart, goodPart);

// Fallback: If exact match failed (due to whitespace), we try a more aggressive replacement
if (content.indexOf(goodPart) === -1) {
    console.log("Exact match failed, trying aggressive replacement...");
    const regex = /DISMISS\s+<\/button>\s+<\/div>\s+{webStorage[\s\S]*?<\/div>\s+<\/div>\s+<\/div>/;
    
    // Construct replacement:
    // DISMISS </button> </div> {webStorage...} </button> )} </div> </div>
    // Removing one </div>
    
    // Let's just forcefully fix the end of that block logic
    // The previous patch added a closing div that shouldn't be there.
    // It replaced `DISMISS </button>` with `DISMISS </button> </div> {webStorage...}`
    // But the original block was `DISMISS </button> </div> </div> </div>` (Sequence of closing divs)
    // No, original was:
    // <div flex-gap-5> <JSON> <DISMISS> </button> </div>
    // </div> (flex-col-gap-5)
    // </div> (flex-col-gap-4)
    
    // My previous patch made it:
    // <div flex-gap-5> <JSON> <DISMISS> </button> </div>
    // {webStorage...}
    // </div> (flex-col-gap-5 ??? NO, I added an extra one?)
    
    // Let's just read the file and manually slice.
}

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Fixed JSX structure (attempt 2)');
