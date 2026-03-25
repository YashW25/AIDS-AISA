import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  proxyUrl: string;
  createdTime: string;
  size?: string;
}

interface DriveGalleryProps {
  folderUrl: string;
  pageSize?: number;
  className?: string;
}

export function DriveGallery({ folderUrl, pageSize = 24, className = '' }: DriveGalleryProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchImages = useCallback(async (pageToken?: string) => {
    if (!folderUrl) return;
    
    try {
      const isInitial = !pageToken;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);
      
      // Use fetch directly for GET with query params
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-drive-api`);
      url.searchParams.set('action', 'list');
      url.searchParams.set('folderUrl', folderUrl);
      url.searchParams.set('pageSize', pageSize.toString());
      if (pageToken) url.searchParams.set('pageToken', pageToken);
      
      const response = await fetch(url.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load images');
      }
      
      const result = await response.json();
      
      if (isInitial) {
        setFiles(result.files || []);
      } else {
        setFiles(prev => [...prev, ...(result.files || [])]);
      }
      setNextPageToken(result.nextPageToken || null);
      setError(null);
    } catch (err: any) {
      console.error('Gallery fetch error:', err);
      setError(err.message || 'Failed to load gallery');
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

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < files.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation
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

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No images found in this gallery</p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
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
                // Fallback to proxy URL if thumbnail fails
                const target = e.target as HTMLImageElement;
                if (target.src !== file.proxyUrl) {
                  target.src = file.proxyUrl;
                }
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

      {/* Load More Button */}
      {nextPageToken && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => fetchImages(nextPageToken)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && files[currentIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* Image */}
          <div 
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={files[currentIndex].proxyUrl}
              alt={files[currentIndex].name}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 text-center text-white bg-black/50 py-2 px-4">
              <p className="truncate">{files[currentIndex].name}</p>
              <p className="text-sm text-gray-400">
                {currentIndex + 1} / {files.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-50 p-2"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            aria-label="Next"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </>
  );
}