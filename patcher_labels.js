const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// Update button labels to match the user's successful version
content = content.replace('{copiedJson ? <><Check size={24} /> JSON PACKED</> : <><FileJson size={24} /> CLONE JSON (SAFE)</>}', 
                        '{copiedJson ? <><Check size={24} /> JSON COPIADO</> : <><FileJson size={24} /> COPIAR JSON (RECOMENDADO)</>}');

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
