import type { Context } from "https://edge.netlify.com";

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

  if (!isBot(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const hostname = url.hostname;
  const origin = url.origin;

  // Correct AISA Club defaults — used when Supabase fetch is unavailable
  let metadata = {
    title: 'AISA Club | ISBM College of Engineering, Pune',
    description: 'Official AISA Club website of ISBM College of Engineering, Pune. Explore upcoming events, notices, gallery, team, downloads, and more.',
    image: `${origin}/preview.png`,
    url: origin,
    siteName: 'AISA Club — ISBM College of Engineering',
  };

  try {
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/functions/v1/og-metadata?domain=${hostname}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.title && data.title !== 'Student Club Portal') {
          metadata = {
            title: data.title || metadata.title,
            description: data.description || metadata.description,
            image: data.image ? data.image.replace('/og-image.png', '/preview.png') : metadata.image,
            url: data.url || metadata.url,
            siteName: data.siteName || metadata.siteName,
          };
        }
      }
    }
  } catch (_) {
    // Use defaults defined above
  }

  const response = await context.next();
  const html = await response.text();

  const modifiedHtml = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(metadata.title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escapeHtml(metadata.image)}"`)
    .replace(/<meta property="og:image:secure_url" content="[^"]*"/, `<meta property="og:image:secure_url" content="${escapeHtml(metadata.image)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escapeHtml(metadata.url)}"`)
    .replace(/<meta property="og:site_name" content="[^"]*"/, `<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${escapeHtml(metadata.image)}"`)
    .replace('</head>', `
    <meta property="og:image:width" content="1909" />
    <meta property="og:image:height" content="963" />
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
