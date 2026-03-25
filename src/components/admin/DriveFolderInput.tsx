import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, FolderOpen, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DriveFolderInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function DriveFolderInput({ value, onChange, disabled }: DriveFolderInputProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    folderName?: string;
  } | null>(null);

  const verifyFolder = async () => {
    if (!value) return;
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-drive-api`);
      url.searchParams.set('action', 'verify');
      url.searchParams.set('folderUrl', value);
      
      const response = await fetch(url.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setVerificationResult({
          success: true,
          message: 'Folder verified successfully!',
          folderName: result.folder?.name,
        });
      } else {
        setVerificationResult({
          success: false,
          message: result.error || 'Verification failed',
        });
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || 'Failed to verify folder',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="drive-folder">Google Drive Gallery Folder</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                Paste a Google Drive folder link containing event photos. 
                Make sure the folder is shared with: 
                <span className="block mt-1 font-mono text-xs bg-muted p-1 rounded">
                  drive-proxy-service@create-457414.iam.gserviceaccount.com
                </span>
                (as Viewer)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="drive-folder"
            placeholder="https://drive.google.com/drive/folders/..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setVerificationResult(null);
            }}
            disabled={disabled}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={verifyFolder}
          disabled={!value || verifying || disabled}
        >
          {verifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Verify'
          )}
        </Button>
      </div>
      
      {verificationResult && (
        <div className={`flex items-center gap-2 text-sm ${
          verificationResult.success ? 'text-green-600' : 'text-destructive'
        }`}>
          {verificationResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>
            {verificationResult.message}
            {verificationResult.folderName && (
              <span className="font-medium ml-1">({verificationResult.folderName})</span>
            )}
          </span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Images from this folder will be displayed in the event gallery. Only images are shown.
      </p>
    </div>
  );
}