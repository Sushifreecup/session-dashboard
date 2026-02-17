const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// Fix: if (entries.length === 0) return sessionCookies[0].domain.replace(/^\./, "");
// Bad: sessionCookies usage.
// Good: usageList usage.

// We need "usageList[0]" and if usageList is strings, then no ".domain".
// usageList is string[].
// So return usageList[0].replace(...)

const badFallback = `if (entries.length === 0) return sessionCookies[0].domain.replace(/^\\. /, "");`;
const goodFallback = `if (entries.length === 0) return usageList[0].replace(/^\\. /, "");`;

// Again, replace regex string is tricky.
const badFallbackRegex = /if \(entries\.length === 0\) return sessionCookies\[0\]\.domain\.replace\([^\)]+\)/m;
content = content.replace(badFallbackRegex, `if (entries.length === 0) return usageList[0].replace(/^\\./, "");`);

// Fallback: simple string replace if regex fails
if (content.includes("return sessionCookies[0].domain")) {
    console.log("Replacing sessionCookies fallback...");
    // This is safer to target unique line
    const match = content.match(/if \(entries\.length === 0\) return sessionCookies\[0\][^\r\n]*/);
    if (match) {
        content = content.replace(match[0], `if (entries.length === 0) return usageList[0].replace(/^\\./, "");`);
    }
}

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Fixed fallback crash');
