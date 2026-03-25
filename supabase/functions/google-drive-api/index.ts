import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Cache ---
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 300000; // 5 minutes

function getFromCache(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// --- Utilities ---
function extractFolderId(url: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) return url;
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  return null;
}

async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) throw new Error('Service account credentials not configured');
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signatureInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const jwt = `${signatureInput}.${signatureB64}`;
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  if (!tokenResponse.ok) throw new Error('Failed to authenticate with Google API');
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// --- API Actions ---
async function verifyFolder(folderId: string) {
  const accessToken = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!res.ok) {
    if (res.status === 404) return { success: false, error: 'Folder not found.' };
    if (res.status === 403) return { success: false, error: 'Access denied. Please check service account permissions.' };
    return { success: false, error: 'Failed to verify folder access.' };
  }
  
  const folder = await res.json();
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    return { success: false, error: 'The link is not a folder.' };
  }
  
  return { success: true, folder: { id: folder.id, name: folder.name } };
}

async function listFolderImages(folderId: string, pageToken?: string, pageSize = 24) {
  const cacheKey = `list:${folderId}:${pageToken || 'first'}:${pageSize}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  const accessToken = await getAccessToken();
  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const fields = 'nextPageToken,files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size)';
  
  let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=createdTime desc`;
  if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
  
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  
  if (!res.ok) throw new Error('Failed to list folder contents.');
  
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

async function proxyImage(fileId: string) {
  const accessToken = await getAccessToken();
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!metaRes.ok) throw new Error('File not found');
  const meta = await metaRes.json();
  
  const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!fileRes.ok) throw new Error('Failed to download file');
  
  return new Response(fileRes.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': meta.mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (action === 'verify') {
      const folderUrl = url.searchParams.get('folderUrl');
      if (!folderUrl) throw new Error('Missing folderUrl');
      const folderId = extractFolderId(folderUrl);
      if (!folderId) throw new Error('Invalid folder URL');
      const result = await verifyFolder(folderId);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'list') {
      const folderUrl = url.searchParams.get('folderUrl');
      const pageToken = url.searchParams.get('pageToken') || undefined;
      const pageSize = parseInt(url.searchParams.get('pageSize') || '24');
      
      if (!folderUrl) throw new Error('Missing folderUrl');
      const folderId = extractFolderId(folderUrl);
      if (!folderId) throw new Error('Invalid folder URL');
      
      const data = await listFolderImages(folderId, pageToken, pageSize);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const files = data.files?.map((file: any) => ({
        ...file,
        proxyUrl: `${supabaseUrl}/functions/v1/google-drive-api?action=proxy&fileId=${file.id}`,
      })) || [];
      
      return new Response(JSON.stringify({ files, nextPageToken: data.nextPageToken }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'proxy') {
      const fileId = url.searchParams.get('fileId');
      if (!fileId) throw new Error('Missing fileId parameter');
      return await proxyImage(fileId);
    }
    
    throw new Error('Invalid action');
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
