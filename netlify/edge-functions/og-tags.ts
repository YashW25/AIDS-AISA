import type { Context } from "https://edge.netlify.com";

// Bot user agents that need pre-rendered meta tags
const BOT_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Pinterest',
  'Discordbot',
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Only intercept for bots/crawlers
  if (!isBot(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Fetch club metadata from Supabase edge function
  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
  
  let metadata = {
    title: 'Student Club Portal',
    description: 'Empowering future leaders through innovation and excellence',
    image: `${url.origin}/og-image.png`,
    url: url.origin,
    siteName: 'Student Club Portal',
  };

  try {
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/functions/v1/og-metadata?domain=${hostname}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        metadata = {
          title: data.title || metadata.title,
          description: data.description || metadata.description,
          image: data.image || metadata.image,
          url: data.url || metadata.url,
          siteName: data.siteName || metadata.siteName,
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch club metadata:', error);
  }

  // Get the original response
  const response = await context.next();
  const html = await response.text();

  // Replace meta tags with dynamic club-specific values
  const modifiedHtml = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(metadata.title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escapeHtml(metadata.image)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escapeHtml(metadata.url)}"`)
    .replace(/<meta property="og:site_name" content="[^"]*"/, `<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${escapeHtml(metadata.image)}"`)
    // Add missing meta tags if not present
    .replace('</head>', `
    <meta property="og:url" content="${escapeHtml(metadata.url)}" />
    <meta property="og:site_name" content="${escapeHtml(metadata.siteName)}" />
    <link rel="canonical" href="${escapeHtml(metadata.url)}" />
    </head>`);

  return new Response(modifiedHtml, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'content-type': 'text/html; charset=utf-8',
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const config = {
  path: "/*",
};
