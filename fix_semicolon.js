const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// Fix double semicolon and possible other small issues
content = content.replace('replace(/^\\. /, "");;', 'replace(/^\\. /, "");');

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Fixed double semicolon');
