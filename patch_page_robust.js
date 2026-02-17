const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// 1. Update identifyAccount signature to include extraDomains
content = content.replace(
  `const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {`,
  `const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string, extraDomains: string[] = []): AccountInfo => {`
);

// 2. Update identifyAccount to use extraDomains in domainStr
content = content.replace(
  `    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");`,
  `    const allDomains = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    const domainStr = allDomains.map(d => d.toLowerCase()).join(" ");`
);

// 3. Update getPrimaryDomainFromCookies call inside identifyAccount
content = content.replace(
  `    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);`,
  `    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies, extraDomains);`
);

// 4. Update getPrimaryDomainFromCookies definition
content = content.replace(
  `  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[]): string => {
    if (sessionCookies.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    sessionCookies.forEach(c => {`,
  `  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[], extraDomains: string[] = []): string => {
    const usageList = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    if (usageList.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    usageList.forEach(domain => {`
);

// 5. Update loop inside getPrimaryDomainFromCookies to use `domain` variable
content = content.replace(
  `      const d = c.domain.replace(/^\\. /, "").toLowerCase();`, 
  `      const d = domain.replace(/^\\. /, "").toLowerCase();`
);
// Fixing regex escape in string above...
// Actually, let's just replace the whole loop body logic safely.
// The original was: `const d = c.domain.replace(/^\./, "").toLowerCase();`
// We need: `const d = domain.replace(/^\./, "").toLowerCase();`

content = content.replace(
  `const d = c.domain.replace(/^\\. /, "").toLowerCase();`,
  `const d = domain.replace(/^\\. /, "").toLowerCase();`
);
// Wait, regex escaping in replace string is tricky.
// Better match unique context around it.
const oldLoop = `    sessionCookies.forEach(c => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = c.domain.replace(/^\\. /, "").toLowerCase();`;

const newLoop = `    usageList.forEach(domain => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = domain.replace(/^\\. /, "").toLowerCase();`;

// The regex in original file is /^\./ which is tricky to match with string literal if escaping differs.
// Let's use indexOf to find it.

// 6. Update fetchSessions
const oldFetch = `      // UNIVERSAL FETCH: Get a broad sample of cookies for ALL sessions
      // This ensures we see ALL domains (WhatsApp, Blackboard, etc.) not just Google/YouTube
      const { data: allCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .limit(10000);`;

const newFetch = `      // UNIVERSAL FETCH: Get a broad sample of cookies AND storage for ALL sessions
      // This ensures we see ALL domains (WhatsApp, Blackboard, etc.) not just Google/YouTube
      const { data: allCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .limit(10000);

      const { data: allStorage } = await supabase
        .from("web_storage")
        .select("snapshot_id, domain, storage_type")
        .in("snapshot_id", sessionIds)
        .limit(2000);`;

content = content.replace(oldFetch, newFetch);

// 7. Update the mapping loop in fetchSessions
const oldMapLoop = `      const newAccountMap: Record<string, AccountInfo> = {};
      sessionData.forEach(session => {
        const sessionCookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        newAccountMap[session.id] = identifyAccount(sessionCookies, session.user_id);
      });
      setAccountMap(newAccountMap);
      setSessions(sessionData);`;

const newMapLoop = `      const newAccountMap: Record<string, AccountInfo & { filterMe?: boolean }> = {};
      sessionData.forEach(session => {
        const sessionCookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        const sessionStorage = (allStorage || []).filter(s => s.snapshot_id === session.id);
        
        const combinedDomains = [
            ...sessionCookies.map(c => c.domain),
            ...sessionStorage.map(s => s.domain)
        ];
        
        const identity = identifyAccount(sessionCookies, session.user_id, combinedDomains);
        
        // FILTER: Only include if identified properly OR has data
        if (identity.domain !== "unknown.com" || sessionCookies.length > 0 || sessionStorage.length > 0) {
           newAccountMap[session.id] = identity;
        } else {
           newAccountMap[session.id] = { ...identity, filterMe: true };
        }
      });
      
      const validSessions = sessionData.filter(s => !newAccountMap[s.id]?.filterMe);
      const validAccountMap: Record<string, AccountInfo> = {};
      validSessions.forEach(s => validAccountMap[s.id] = newAccountMap[s.id]);
      
      setAccountMap(validAccountMap);
      setSessions(validSessions);`;

content = content.replace(oldMapLoop, newMapLoop);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Patched page.tsx successfully');
