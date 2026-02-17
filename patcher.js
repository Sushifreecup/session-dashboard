const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

const startTag = '  const copyCookiesJson = () => {';
const searchMarker = '    navigator.clipboard.writeText(json).then(() => {';

const startIndex = content.indexOf(startTag);
if (startIndex === -1) {
    console.error('Start tag not found');
    process.exit(1);
}

const markerIndex = content.indexOf(searchMarker, startIndex);
if (markerIndex === -1) {
    console.error('Marker not found');
    process.exit(1);
}

const closingBraceIndex = content.indexOf('  };', markerIndex);
if (closingBraceIndex === -1) {
    console.error('Closing brace not found');
    process.exit(1);
}

const replacement = JSON.parse(fs.readFileSync('new_func.txt', 'utf8'));
const newContent = content.substring(0, startIndex) + replacement + content.substring(closingBraceIndex + 4);

fs.writeFileSync('src/app/sessions/page.tsx', newContent, 'utf8');
