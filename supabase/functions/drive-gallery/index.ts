import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for folder listings (5 min TTL)
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getFromCache(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

// Extract folder ID from various Google Drive URL formats
function extractFolderId(url: string): string | null {
  if (!url) return null;
  
  // Direct folder ID
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    return url;
  }
  
  // https://drive.google.com/drive/folders/FOLDER_ID
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  
  // https://drive.google.com/drive/u/0/folders/FOLDER_ID
  const folderMatch2 = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch2) return folderMatch2[1];
  
  return null;
}

// Generate JWT for service account auth
async function getAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    throw new Error('Service account credentials not configured');
  }
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  
  // Encode header and payload
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Import private key and sign
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
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const jwt = `${signatureInput}.${signatureB64}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to authenticate with Google');
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// List images in a folder
async function listFolderImages(folderId: string, pageToken?: string, pageSize = 24) {
  const cacheKey = `list:${folderId}:${pageToken || 'first'}:${pageSize}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('Returning cached result for', cacheKey);
    return cached;
  }
  
  const accessToken = await getAccessToken();
  
  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const fields = 'nextPageToken,files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size)';
  
  let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=createdTime desc`;
  
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Drive API error:', response.status, error);
    if (response.status === 404) {
      throw new Error('Folder not found');
    }
    if (response.status === 403) {
      throw new Error('Access denied. Please share the folder with the service account.');
    }
    throw new Error('Failed to list folder contents');
  }
  
  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

// Verify folder access
async function verifyFolder(folderId: string) {
  const accessToken = await getAccessToken();
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Verify folder error:', response.status, error);
    if (response.status === 404) {
      return { success: false, error: 'Folder not found. Please check the folder link.' };
    }
    if (response.status === 403) {
      return { 
        success: false, 
        error: 'Access denied. Please share the folder with: drive-proxy-service@create-457414.iam.gserviceaccount.com' 
      };
    }
    return { success: false, error: 'Failed to verify folder access' };
  }
  
  const folder = await response.json();
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    return { success: false, error: 'The link does not point to a folder' };
  }
  
  return { success: true, folder: { id: folder.id, name: folder.name } };
}

// Proxy image through backend
async function proxyImage(fileId: string) {
  const accessToken = await getAccessToken();
  
  // Get file metadata to check if it's an image
  const metaResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,size`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!metaResponse.ok) {
    throw new Error('File not found');
  }
  
  const meta = await metaResponse.json();
  
  // Download the file
  const fileResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  
  if (!fileResponse.ok) {
    throw new Error('Failed to download file');
  }
  
  return new Response(fileResponse.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': meta.mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (action === 'verify') {
      const folderUrl = url.searchParams.get('folderUrl');
      if (!folderUrl) {
        return new Response(JSON.stringify({ error: 'Missing folderUrl parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const folderId = extractFolderId(folderUrl);
      if (!folderId) {
        return new Response(JSON.stringify({ error: 'Invalid folder URL format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
      
      if (!folderUrl) {
        return new Response(JSON.stringify({ error: 'Missing folderUrl parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const folderId = extractFolderId(folderUrl);
      if (!folderId) {
        return new Response(JSON.stringify({ error: 'Invalid folder URL format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const data = await listFolderImages(folderId, pageToken, pageSize);
      
      // Transform response to include proxy URLs
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const files = data.files?.map((file: any) => ({
        ...file,
        proxyUrl: `${supabaseUrl}/functions/v1/drive-gallery?action=proxy&fileId=${file.id}`,
      })) || [];
      
      return new Response(JSON.stringify({ 
        files,
        nextPageToken: data.nextPageToken,
        totalCount: files.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'proxy') {
      const fileId = url.searchParams.get('fileId');
      if (!fileId) {
        return new Response(JSON.stringify({ error: 'Missing fileId parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return await proxyImage(fileId);
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action. Use: verify, list, or proxy' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Edge function error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});