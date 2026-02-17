const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

// ============================================================
// FIX 1: Rewrite fetchSessions to ALWAYS fetch a broad domain sample
// The old logic: Stage 1 fetches named cookies (SID, __Secure-1PSID, etc.)
//   -> These Google cookies exist in EVERY session
//   -> Stage 2 (broad sample) never triggers
//   -> identifyAccount only sees Google/YouTube domains
// New logic: Always fetch a broad sample of DISTINCT domains per session
// ============================================================

const oldFetch = `      // STAGE 1: Fetch key ID cookies for ALL sessions (Highly efficient)
      const { data: idCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .or("name.eq.c_user,name.eq.ds_user_id,name.eq.sessionid,name.eq.SID,name.eq.li_at,name.eq.LOGIN_INFO,name.eq.__Secure-1PSID,name.eq.x-session-id");
      
      // STAGE 2: Fetch general domains for sessions that STILL have no cookies
      const identifiedIds = new Set(idCookies?.map(c => c.snapshot_id) || []);
      const missingIds = sessionIds.filter(id => !identifiedIds.has(id));
      
      let allCookies = [...(idCookies || [])];
      
      if (missingIds.length > 0) {
          const { data: fallbackCookies } = await supabase
            .from("cookies")
            .select("snapshot_id, domain, name, value, expiration_date")
            .in("snapshot_id", missingIds)
            .limit(5000); // Fetch a sample of any cookie to get the domain
          if (fallbackCookies) allCookies = [...allCookies, ...fallbackCookies];
      }`;

const newFetch = `      // UNIVERSAL FETCH: Get a broad sample of cookies for ALL sessions
      // This ensures we see ALL domains (WhatsApp, Blackboard, etc.) not just Google/YouTube
      const { data: allCookies } = await supabase
        .from("cookies")
        .select("snapshot_id, domain, name, value, expiration_date")
        .in("snapshot_id", sessionIds)
        .limit(10000);`;

content = content.replace(oldFetch, newFetch);

// ============================================================
// FIX 2: Rewrite identifyAccount with:
//   - WhatsApp detection
//   - Smarter noise filtering for getPrimaryDomain
//   - Fix the domainStr bug on line 100
//   - Add TikTok, Spotify, Pinterest, Discord detection
// ============================================================

const oldIdentify = `  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);
    const pd = primaryDomain.toLowerCase();
    
    // SMART IDENTIFICATION: Use primaryDomain (most frequent) as primary signal.
    // This prevents ubiquitous domains (Google, YouTube) from overshadowing niche ones (Blackboard).

    // TIER 1: Identify by PRIMARY domain (most cookies = most likely the active site)
    if (pd.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    }
    if (pd.includes("facebook.com")) {
      const fbId = sessionCookies.find(c => c.name === "c_user")?.value;
      return { platform: "Facebook", identifier: fbId || "Account", icon: Facebook, color: "text-blue-500", health, domain: "facebook.com" };
    }
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    }
    if (pd.includes("up.edu.pe") || pd.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "up.edu.pe" };
    if (pd.includes("youtube.com"))
      return { platform: "YouTube", identifier: "YouTube Viewer", icon: Youtube, color: "text-red-500", health, domain: "youtube.com" };
    if (pd.includes("grok.com"))
      return { platform: "Grok AI", identifier: "AI Brain", icon: Bot, color: "text-purple-400", health, domain: "grok.com" };
    if (pd.includes("linkedin.com"))
      return { platform: "LinkedIn", identifier: "Professional Profile", icon: Linkedin, color: "text-blue-600", health, domain: "linkedin.com" };
    if (pd.includes("mercadolibre.com"))
      return { platform: "Mercado Libre", identifier: "Account", icon: ShoppingCart, color: "text-yellow-400", health, domain: "mercadolibre.com" };
    if (pd.includes("gemini.google.com"))
      return { platform: "Gemini", identifier: "LLM Session", icon: MessageSquare, color: "text-blue-300", health, domain: "gemini.google.com" };
    if (pd.includes("openai.com") || pd.includes("chatgpt.com"))
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health, domain: "chatgpt.com" };
    if (pd.includes("kick.com"))
      return { platform: "Kick", identifier: "Stream Session", icon: Gamepad2, color: "text-green-500", health, domain: "kick.com" };
    if (pd.includes("x.com") || pd.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social ID", icon: Twitter, color: "text-blue-400", health, domain: "x.com" };
    if (pd.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Streaming User", icon: Play, color: "text-red-600", health, domain: "netflix.com" };
    if (pd.includes("google.com")) {
      const email = sessionCookies.find(c => c.name.includes("email"))?.value;
      return { platform: "Google", identifier: email || "Google User", icon: Globe, color: "text-red-400", health, domain: "google.com" };
    }

    // TIER 2: Fallback - check ALL domains if primaryDomain didn't match anything known
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "up.edu.pe" };
    if (domainStr.includes("instagram.com")) {
      const igId = sessionCookies.find(c => c.name === "ds_user_id")?.value;
      return { platform: "Instagram", identifier: igId || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    }

    // Generic labeling for unknown platforms
    const capitalizedName = primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1);
    return { platform: capitalizedName || "External", identifier: fallbackId || "Active Session", icon: Shield, color: "text-blue-400", health, domain: primaryDomain };
  };`;

const newIdentify = `  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");
    
    // PRIORITY AUTH DETECTION: Check for platform-specific auth cookies FIRST
    // This is more reliable than domain frequency since Google/YouTube are omnipresent
    
    // WhatsApp Web
    if (domainStr.includes("whatsapp.com") || domainStr.includes("web.whatsapp.com"))
      return { platform: "WhatsApp", identifier: "WhatsApp Web", icon: MessageSquare, color: "text-green-500", health, domain: "web.whatsapp.com" };
    
    // Instagram (check auth cookie)
    const igUser = sessionCookies.find(c => c.name === "ds_user_id" && c.domain.includes("instagram"));
    if (igUser)
      return { platform: "Instagram", identifier: igUser.value || "Account", icon: Instagram, color: "text-pink-500", health, domain: "instagram.com" };
    
    // Facebook (check auth cookie)
    const fbUser = sessionCookies.find(c => c.name === "c_user" && c.domain.includes("facebook"));
    if (fbUser)
      return { platform: "Facebook", identifier: fbUser.value || "Account", icon: Facebook, color: "text-blue-500", health, domain: "facebook.com" };
    
    // Blackboard / UP.edu.pe
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "up.edu.pe" };
    
    // TikTok
    if (domainStr.includes("tiktok.com"))
      return { platform: "TikTok", identifier: "TikTok User", icon: Play, color: "text-pink-400", health, domain: "tiktok.com" };
    
    // Discord
    if (domainStr.includes("discord.com"))
      return { platform: "Discord", identifier: "Discord User", icon: MessageSquare, color: "text-indigo-400", health, domain: "discord.com" };
    
    // Spotify
    if (domainStr.includes("spotify.com"))
      return { platform: "Spotify", identifier: "Spotify Listener", icon: Play, color: "text-green-400", health, domain: "spotify.com" };
    
    // ChatGPT / OpenAI
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com"))
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health, domain: "chatgpt.com" };
    
    // Grok
    if (domainStr.includes("grok.com"))
      return { platform: "Grok AI", identifier: "AI Brain", icon: Bot, color: "text-purple-400", health, domain: "grok.com" };
    
    // Gemini
    if (domainStr.includes("gemini.google.com"))
      return { platform: "Gemini", identifier: "LLM Session", icon: MessageSquare, color: "text-blue-300", health, domain: "gemini.google.com" };
    
    // LinkedIn
    if (domainStr.includes("linkedin.com"))
      return { platform: "LinkedIn", identifier: "Professional Profile", icon: Linkedin, color: "text-blue-600", health, domain: "linkedin.com" };
    
    // Mercado Libre
    if (domainStr.includes("mercadolibre.com"))
      return { platform: "Mercado Libre", identifier: "Account", icon: ShoppingCart, color: "text-yellow-400", health, domain: "mercadolibre.com" };
    
    // X / Twitter
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social ID", icon: Twitter, color: "text-blue-400", health, domain: "x.com" };
    
    // Kick
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Stream Session", icon: Gamepad2, color: "text-green-500", health, domain: "kick.com" };
    
    // Netflix
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Streaming User", icon: Play, color: "text-red-600", health, domain: "netflix.com" };
    
    // Pinterest
    if (domainStr.includes("pinterest.com"))
      return { platform: "Pinterest", identifier: "Pinterest User", icon: Globe, color: "text-red-500", health, domain: "pinterest.com" };
    
    // YouTube (AFTER all specific platforms, since YouTube cookies exist everywhere)
    const ytAuth = sessionCookies.find(c => c.name === "LOGIN_INFO" && c.domain.includes("youtube"));
    if (ytAuth)
      return { platform: "YouTube", identifier: "YouTube Viewer", icon: Youtube, color: "text-red-500", health, domain: "youtube.com" };
    
    // Google (LAST since google.com cookies are in every session)
    if (domainStr.includes("google.com")) {
      const email = sessionCookies.find(c => c.name.includes("email"))?.value;
      return { platform: "Google", identifier: email || "Google User", icon: Globe, color: "text-red-400", health, domain: "google.com" };
    }

    // Generic fallback
    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);
    const capitalizedName = primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1);
    return { platform: capitalizedName || "External", identifier: fallbackId || "Active Session", icon: Shield, color: "text-blue-400", health, domain: primaryDomain };
  };`;

content = content.replace(oldIdentify, newIdentify);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Patched successfully');
