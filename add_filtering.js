const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// 1. Update identifyAccount to support web_storage input
// ---------------------------------------------------------------------

// Modify function signature and usage
// We will change: `identifyAccount(sessionCookies, ...)` 
// into: `identifyAccount(sessionCookies, webStorageEntries, ...)`
// Or simpler: Just filter sessions with empty cookies + empty storage? No, we want to identify them.

// Let's modify fetchSessions first to get web_storage
content = content.replace(
  `      // UNIVERSAL FETCH: Get a broad sample of cookies for ALL sessions
      // This ensures we see ALL domains (WhatsApp, Blackboard, etc.) not just Google/YouTube
      const { data: allCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .limit(10000);`,
        
  `      // UNIVERSAL FETCH: Get a broad sample of cookies AND storage for ALL sessions
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
        .limit(2000);`
);

// Update identifying calls
content = content.replace(
  `        const sessionCookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        newAccountMap[session.id] = identifyAccount(sessionCookies, session.user_id);
      });
      setAccountMap(newAccountMap);
      setSessions(sessionData);`,
      
  `        const sessionCookies = (allCookies || []).filter(c => c.snapshot_id === session.id);
        const sessionStorage = (allStorage || []).filter(s => s.snapshot_id === session.id);
        
        // Combine domains for identification
        const combinedDomains = [
            ...sessionCookies.map(c => c.domain),
            ...sessionStorage.map(s => s.domain)
        ];
        
        const identity = identifyAccount(sessionCookies, session.user_id, combinedDomains);
        
        // FILTER: Only include if identified properly OR has data
        if (identity.domain !== "unknown.com" || sessionCookies.length > 0 || sessionStorage.length > 0) {
           newAccountMap[session.id] = identity;
        } else {
           // Mark for filtering
           newAccountMap[session.id] = { ...identity, filterMe: true };
        }
      });
      
      // Filter sessions
      const validSessions = sessionData.filter(s => !newAccountMap[s.id]?.filterMe);
      const validAccountMap = {};
      validSessions.forEach(s => validAccountMap[s.id] = newAccountMap[s.id]);
      
      setAccountMap(validAccountMap);
      setSessions(validSessions);`
);


// Update identifyAccount signature and usage of combinedDomains
// Function definition line:
// const identifyAccount = (sessionCookies: { ... }[], fallbackId: string): AccountInfo => {

// We need to inject combinedDomains as 3rd arg
// But wait, the function `identifyAccount` calculates `domainStr` from `sessionCookies`.
// We need it to use `combinedDomains` instead.

content = content.replace(
  `const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");`,
    
  `const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string, extraDomains: string[] = []): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    // Use extraDomains if provided, otherwise fallback to cookies
    const allDomains = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    const domainStr = allDomains.map(d => d.toLowerCase()).join(" ");`
);

// Update getPrimaryDomainFromCookies call inside identifyAccount
// It only takes sessionCookies. We should update it or assume sessionCookies is enough for primary domain frequency?
// Actually, `getPrimaryDomainFromCookies` uses `sessionCookies`. We should pass `extraDomains` too.

content = content.replace(
  `    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);`,
  `    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies, extraDomains);`
);

// Update getPrimaryDomainFromCookies definition
content = content.replace(
  `  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[]): string => {
    if (sessionCookies.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    sessionCookies.forEach(c => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = c.domain.replace(/^\./, "").toLowerCase();`,
      
  `  const getPrimaryDomainFromCookies = (sessionCookies: { domain: string }[], extraDomains: string[] = []): string => {
    const usageList = extraDomains.length > 0 ? extraDomains : sessionCookies.map(c => c.domain);
    if (usageList.length === 0) return "unknown.com";
    
    const domainCounts: Record<string, number> = {};
    usageList.forEach(domain => {
      // Clean domain: Remove leading dot and convert to lowercase
      const d = domain.replace(/^\./, "").toLowerCase();`
);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Patched page.tsx for filtering and storage identification');
