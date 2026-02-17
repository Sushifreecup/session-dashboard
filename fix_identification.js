const fs = require('fs');
let content = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

const oldFunc = `  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
    const health = getHealthStatus(sessionCookies);
    const domainStr = sessionCookies.map(c => c.domain.toLowerCase()).join(" ");
    const primaryDomain = getPrimaryDomainFromCookies(sessionCookies);
    
    // Platform detection logic
    if (domainStr.includes("facebook.com")) {`;

const newFunc = `  const identifyAccount = (sessionCookies: { domain: string, name: string, value: string, expiration_date: number | null }[], fallbackId: string): AccountInfo => {
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
    if (pd.includes("facebook.com")) {`;

content = content.replace(oldFunc, newFunc);

// Replace the rest of the old chain with the new one
const oldChain = `    if (domainStr.includes("youtube.com") || domainStr.includes("google.com/youtube")) {
      return { platform: "YouTube", identifier: "YouTube Viewer", icon: Youtube, color: "text-red-500", health, domain: "youtube.com" };
    }
    if (domainStr.includes("grok.com") || domainStr.includes("x.com/i/grok")) {
      return { platform: "Grok AI", identifier: "AI Brain", icon: Bot, color: "text-purple-400", health, domain: "grok.com" };
    }
    if (domainStr.includes("linkedin.com")) {
      return { platform: "LinkedIn", identifier: "Professional Profile", icon: Linkedin, color: "text-blue-600", health, domain: "linkedin.com" };
    }
    if (domainStr.includes("mercadolibre.com")) {
      return { platform: "Mercado Libre", identifier: "Account", icon: ShoppingCart, color: "text-yellow-400", health, domain: "mercadolibre.com" };
    }
    if (domainStr.includes("gemini.google.com")) {
      return { platform: "Gemini", identifier: "LLM Session", icon: MessageSquare, color: "text-blue-300", health, domain: "gemini.google.com" };
    }
    if (domainStr.includes("openai.com") || domainStr.includes("chatgpt.com")) 
      return { platform: "ChatGPT", identifier: "AI Assistant", icon: Cpu, color: "text-emerald-400", health, domain: "chatgpt.com" };
    if (domainStr.includes("kick.com"))
      return { platform: "Kick", identifier: "Stream Session", icon: Gamepad2, color: "text-green-500", health, domain: "kick.com" };
    if (domainStr.includes("x.com") || domainStr.includes("twitter.com"))
      return { platform: "X / Twitter", identifier: "Social ID", icon: Twitter, color: "text-blue-400", health, domain: "x.com" };
    if (domainStr.includes("netflix.com"))
      return { platform: "Netflix", identifier: "Streaming User", icon: Play, color: "text-red-600", health, domain: "netflix.com" };
    if (domainStr.includes("up.edu.pe") || domainStr.includes("blackboard.com"))
      return { platform: "Blackboard", identifier: "Academic Portal", icon: GraduationCap, color: "text-blue-400", health, domain: "blackboard.com" };
    if (domainStr.includes("google.com")) {
      const email = sessionCookies.find(c => c.name.includes("email"))?.value;
      return { platform: "Google", identifier: email || "Google User", icon: Globe, color: "text-red-400", health, domain: "google.com" };
    }

    // Generic labeling for unknown platforms
    const capitalizedName = primaryDomain.split('.')[0].charAt(0).toUpperCase() + primaryDomain.split('.')[0].slice(1);
    return { platform: capitalizedName || "External", identifier: fallbackId || "Active Session", icon: Shield, color: "text-blue-400", health, domain: primaryDomain };
  };`;

const newChain = `    if (pd.includes("up.edu.pe") || pd.includes("blackboard.com"))
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

content = content.replace(oldChain, newChain);

fs.writeFileSync('src/app/sessions/page.tsx', content, 'utf8');
console.log('Patched successfully');
