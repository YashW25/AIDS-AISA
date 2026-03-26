import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Save, ExternalLink, Info } from 'lucide-react';

const CharterPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: 'AISA Club Charter',
    description: '',
    file_url: '',
    drive_url: '',
  });

  const { data: charter, isLoading } = useQuery({
    queryKey: ['charter-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_settings')
        .select('id, title, description, file_url, drive_url')
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error fetching charter settings:', error);
        return null;
      }
      return data;
    },
  });

  useEffect(() => {
    if (charter) {
      setFormData({
        title: (charter as any).title || 'AISA Club Charter',
        description: (charter as any).description || '',
        file_url: (charter as any).file_url || '',
        drive_url: (charter as any).drive_url || '',
      });
    }
  }, [charter]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if ((charter as any)?.id) {
        const { error } = await supabase
          .from('charter_settings')
          .update(data as any)
          .eq('id', (charter as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('charter_settings')
          .insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charter-settings'] });
      queryClient.invalidateQueries({ queryKey: ['charter-settings-admin'] });
      toast.success('Charter settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const documentUrl = formData.file_url || formData.drive_url;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Charter</h1>
        <p className="text-muted-foreground">Manage the Charter document displayed on the public Charter page.</p>
      </div>

      {/* Info box about how the charter page works */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">How the Charter page works</p>
          <p className="text-blue-700 dark:text-blue-300">
            The public <strong>/charter</strong> page always shows the club's mission, vision, core values, and a full
            charter template. If you upload a document or link below, it will also appear as an embedded preview with
            download options.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Charter Document Settings
            </CardTitle>
            <CardDescription>
              Optionally upload a PDF or paste a Google Drive link to embed the official charter document.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="AISA Club Charter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (shown in the hero section)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="The guiding principles and constitution that define our organization's purpose and governance..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_url">Uploaded File URL (PDF / Direct link)</Label>
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://... (paste the uploaded PDF URL here)"
              />
              <p className="text-xs text-muted-foreground">Paste the URL after uploading to Supabase Storage or any hosting.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive_url">Google Drive Link (alternative)</Label>
              <Input
                id="drive_url"
                value={formData.drive_url}
                onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste a public Google Drive file link. Ensure "Anyone with the link can view" is enabled.
              </p>
            </div>

            {documentUrl && (
              <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Document linked</p>
                  <p className="text-xs text-muted-foreground truncate">{documentUrl}</p>
                </div>
                <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="outline" size="sm" className="gap-2 flex-shrink-0">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </a>
              </div>
            )}

            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CharterPage;
