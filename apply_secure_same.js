const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

const startTag = '  const copyCookiesJson = () => {';
const searchMarker = '    navigator.clipboard.writeText(json).then(() => {';

const startIndex = content.indexOf(startTag);
const markerIndex = content.indexOf(searchMarker, startIndex);
const closingBraceIndex = content.indexOf('  };', markerIndex);

const replacement = JSON.parse(fs.readFileSync('new_func.txt', 'utf8'));
const newContent = content.substring(0, startIndex) + replacement + content.substring(closingBraceIndex + 4);

fs.writeFileSync('src/app/sessions/page.tsx', newContent, 'utf8');
