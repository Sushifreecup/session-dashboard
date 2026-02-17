const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// Error context:
// usageList.forEach(domain => {
//   // Clean domain: Remove leading dot and convert to lowercase
//   const d = c.domain.replace(/^\./, "").toLowerCase();

// We need to change `c.domain` to `domain`.
// The `.replace(/^\./, "")` is tricky for string replacement because of escaping.
// Let's use simpler context.

const badLine = `const d = c.domain.replace(/^\\. /, "").toLowerCase();`;
// Wait, my previous patch probably used `^\\. ` (space after dot?) which is why it failed to match `/^\./`.

// Let's find the line by its neighbor.
// `usageList.forEach(domain => {` is unique enough (I hope).

const badBlockRegex = /usageList\.forEach\(domain => \{\s*\/\/\s*Clean domain[^\r\n]*\r?\n\s*const d = c\.domain/m;
const goodBlock = `usageList.forEach(domain => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = domain`;

content = content.replace(badBlockRegex, goodBlock);

// Fallback: simple replace if regex fails due to whitespace
if (content.includes("const d = c.domain")) {
    console.log("Using string replace fallback...");
    content = content.replace("const d = c.domain", "const d = domain");
}

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Fixed c.domain variable error');
