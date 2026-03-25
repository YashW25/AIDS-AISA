import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1920; // max width or height after resize
const COMPRESS_QUALITY = 0.82; // JPEG/WebP quality
const COMPRESS_THRESHOLD = 1 * 1024 * 1024; // compress if >1MB

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** A descriptive name for the file, e.g. "john-doe" or "tech-fest-2025". Special chars are sanitized. */
  fileName?: string;
}

/** Compress / resize an image file using Canvas. Returns a new File. */
async function compressImage(file: File): Promise<File> {
  // Skip SVGs and GIFs (can't meaningfully compress via canvas)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  // Skip small files
  if (file.size <= COMPRESS_THRESHOLD) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      // Scale down if needed
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP, fall back to JPEG
      const outputType = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: outputType });
          resolve(compressed);
        },
        outputType,
        COMPRESS_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export function ImageUpload({ value, onChange, folder = 'general', fileName }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

  const processFile = async (originalFile: File) => {
    if (!originalFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (originalFile.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 5 MB');
      return;
    }

    setIsUploading(true);
    try {
      const file = await compressImage(originalFile);
      const fileExt = file.name.split('.').pop();
      const baseName = fileName ? sanitize(fileName) : Math.random().toString(36).substring(2, 10);
      const storagePath = `${folder}/${baseName}-${Date.now()}.${fileExt}`;

      if (file.size < originalFile.size) {
        const saved = ((1 - file.size / originalFile.size) * 100).toFixed(0);
        toast.info(`Image optimized — ${saved}% smaller`);
      }

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(storagePath);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const clearImage = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-xs h-32 object-cover rounded-lg border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, SVG — max 5 MB</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">or</span>
        <Input
          type="url"
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}
