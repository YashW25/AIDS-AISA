import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Save, ExternalLink } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

const CharterPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: 'Charter',
    description: '',
    file_url: '',
    drive_url: '',
    file_type: 'pdf',
  });

  const { data: charter, isLoading } = useQuery({
    queryKey: ['charter-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charter_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (charter) {
      setFormData({
        title: charter.title || 'Charter',
        description: charter.description || '',
        file_url: charter.file_url || '',
        drive_url: charter.drive_url || '',
        file_type: charter.file_type || 'pdf',
      });
    }
  }, [charter]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('charter_settings')
        .update(data)
        .eq('id', charter?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charter-settings'] });
      queryClient.invalidateQueries({ queryKey: ['charter-settings-admin'] });
      toast.success('Charter settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update charter settings');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Charter</h1>
        <p className="text-muted-foreground">Manage the Charter document that will be displayed on the Charter page.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Charter Document Settings
            </CardTitle>
            <CardDescription>
              Upload a PDF or provide a Google Drive link for the charter document. Users will be able to preview and download it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Charter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the charter document..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload PDF File (Optional)</Label>
                <ImageUpload
                  value={formData.file_url}
                  onChange={(url) => setFormData({ ...formData, file_url: url })}
                  folder="charter"
                />
                <p className="text-xs text-muted-foreground">Upload a PDF file directly to storage</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drive_url">Google Drive Link (Alternative)</Label>
                <Input
                  id="drive_url"
                  value={formData.drive_url}
                  onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide a Google Drive link if the file is too large. Make sure the file is publicly accessible.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_type">File Type</Label>
                <select
                  id="file_type"
                  value={formData.file_type}
                  onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Word Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {(formData.file_url || formData.drive_url) && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Preview Link:</p>
                <a
                  href={formData.file_url || formData.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {formData.file_url ? 'View Uploaded File' : 'View on Google Drive'}
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
