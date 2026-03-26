import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Loader2, ExternalLink, Grid3X3 } from 'lucide-react';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').replace(/^["']|["']$/g, '').trim();

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  proxyUrl: string;
  createdTime: string;
}

interface DriveGalleryProps {
  folderUrl: string;
  pageSize?: number;
  className?: string;
}

function extractFolderId(url: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) return url;
  const m = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function DriveEmbedFallback({ folderUrl }: { folderUrl: string }) {
  const folderId = extractFolderId(folderUrl);
  const embedUrl = folderId
    ? `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`
    : null;
  const directUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
    : folderUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="w-4 h-4" />
          <span>Viewing via Google Drive</span>
        </div>
        <a href={directUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Drive
          </Button>
        </a>
      </div>
      {embedUrl ? (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
          <iframe
            src={embedUrl}
            className="w-full"
            style={{ height: '520px', border: 0 }}
            title="Google Drive Gallery"
            allow="autoplay"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm mb-4">Could not parse folder URL.</p>
          <a href={folderUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Folder in Drive
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

export function DriveGallery({ folderUrl, pageSize = 24, className = '' }: DriveGalleryProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchImages = useCallback(async (pageToken?: string) => {
    if (!folderUrl) return;

    const isInitial = !pageToken;
    if (isInitial) {
      setLoading(true);
      setUseFallback(false);
    } else {
      setLoadingMore(true);
    }

    try {
      if (!SUPABASE_URL) {
        setUseFallback(true);
        setLoading(false);
        return;
      }

      const apiUrl = new URL(`${SUPABASE_URL}/functions/v1/google-drive-api`);
      apiUrl.searchParams.set('action', 'list');
      apiUrl.searchParams.set('folderUrl', folderUrl);
      apiUrl.searchParams.set('pageSize', String(pageSize));
      if (pageToken) apiUrl.searchParams.set('pageToken', pageToken);

      const response = await fetch(apiUrl.toString(), {
        headers: { 'apikey': SUPABASE_KEY },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || `HTTP ${response.status}`;
        const isSetupError =
          response.status === 404 ||
          response.status === 502 ||
          msg.includes('not configured') ||
          msg.includes('credentials') ||
          msg.includes('Service account');
        if (isSetupError) {
          setUseFallback(true);
          setLoading(false);
          return;
        }
        throw new Error(msg);
      }

      const result = await response.json();
      if (isInitial) {
        setFiles(result.files || []);
      } else {
        setFiles(prev => [...prev, ...(result.files || [])]);
      }
      setNextPageToken(result.nextPageToken || null);
    } catch {
      setUseFallback(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [folderUrl, pageSize]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : files.length - 1));
  const goToNext = () => setCurrentIndex(prev => (prev < files.length - 1 ? prev + 1 : 0));

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, files.length]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (useFallback) {
    return <DriveEmbedFallback folderUrl={folderUrl} />;
  }

  if (files.length === 0) {
    const folderId = extractFolderId(folderUrl);
    const directUrl = folderId ? `https://drive.google.com/drive/folders/${folderId}` : folderUrl;
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">No images found in this gallery</p>
        <a href={directUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open in Drive
          </Button>
        </a>
      </div>
    );
  }

  const folderId = extractFolderId(folderUrl);
  const directUrl = folderId ? `https://drive.google.com/drive/folders/${folderId}` : folderUrl;

  return (
    <>
      <div className="flex justify-end mb-4">
        <a href={directUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Drive
          </Button>
        </a>
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {files.map((file, index) => (
          <div
            key={file.id}
            className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group relative"
            onClick={() => openLightbox(index)}
          >
            <img
              src={file.thumbnailLink || file.proxyUrl}
              alt={file.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== file.proxyUrl) target.src = file.proxyUrl;
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm truncate w-full">
                {file.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextPageToken && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => fetchImages(nextPageToken)} disabled={loadingMore}>
            {loadingMore ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {lightboxOpen && files[currentIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-50" onClick={closeLightbox} aria-label="Close">
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2" onClick={(e) => { e.stopPropagation(); goToPrevious(); }} aria-label="Previous">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <div className="max-w-[90vw] max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={files[currentIndex].proxyUrl} alt={files[currentIndex].name} className="max-w-full max-h-[85vh] object-contain" />
            <div className="absolute bottom-0 left-0 right-0 text-center text-white bg-black/50 py-2 px-4">
              <p className="truncate">{files[currentIndex].name}</p>
              <p className="text-sm text-gray-400">{currentIndex + 1} / {files.length}</p>
            </div>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2" onClick={(e) => { e.stopPropagation(); goToNext(); }} aria-label="Next">
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </>
  );
}
