import { useState } from 'react';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Download, ExternalLink } from 'lucide-react';

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  drive_url: string | null;
  file_type: string;
  file_size: string | null;
  category: string;
  position: number;
  is_active: boolean;
}

const categories = ['general', 'forms', 'brochures', 'resources', 'events'];

const DownloadsPage = () => {
  const { data: downloads, isLoading } = useAdminFetch<DownloadItem>('downloads', 'downloads');
  const createMutation = useAdminCreate<DownloadItem>('downloads', 'downloads');
  const updateMutation = useAdminUpdate<DownloadItem>('downloads', 'downloads');
  const deleteMutation = useAdminDelete('downloads', 'downloads');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    drive_url: '',
    file_type: 'pdf',
    file_size: '',
    category: 'general',
    position: 0,
    is_active: true,
  });

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'file_type', label: 'Type' },
    { key: 'file_size', label: 'Size' },
    { 
      key: 'file_url', 
      label: 'Source',
      render: (row: DownloadItem) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.drive_url ? 'bg-blue-500/20 text-blue-500' : row.file_url ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
          {row.drive_url ? 'Drive' : row.file_url ? 'Uploaded' : 'No File'}
        </span>
      )
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (item: DownloadItem) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      file_url: '',
      drive_url: '',
      file_type: 'pdf',
      file_size: '',
      category: 'general',
      position: (downloads?.length || 0) + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: DownloadItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      file_url: item.file_url || '',
      drive_url: item.drive_url || '',
      file_type: item.file_type || 'pdf',
      file_size: item.file_size || '',
      category: item.category || 'general',
      position: item.position,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      file_url: formData.file_url || null,
      drive_url: formData.drive_url || null,
      description: formData.description || null,
      file_size: formData.file_size || null,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...submitData }, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      createMutation.mutate(submitData as any, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Downloads</h1>
          <p className="text-muted-foreground text-sm">Manage downloadable files and resources</p>
        </div>
      </div>

      <AdminTable
        title="Downloads"
        data={downloads || []}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isLoading={isLoading}
      />

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Download' : 'Add Download'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Download title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload File (for small files)</Label>
            <ImageUpload
              value={formData.file_url}
              onChange={(url) => setFormData({ ...formData, file_url: url })}
              folder="downloads"
              fileName={formData.title || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drive_url">Google Drive Link (for large files)</Label>
            <Input
              id="drive_url"
              value={formData.drive_url}
              onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
              placeholder="https://drive.google.com/file/d/..."
            />
            <p className="text-xs text-muted-foreground">Use Drive link if file size is large. Make sure the file is publicly accessible.</p>
          </div>

          {(formData.file_url || formData.drive_url) && (
            <div className="p-3 bg-muted rounded-lg">
              <a
                href={formData.file_url || formData.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Preview File
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                <option value="zip">ZIP Archive</option>
                <option value="image">Image</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_size">File Size</Label>
              <Input
                id="file_size"
                value={formData.file_size}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                placeholder="e.g., 2.5 MB"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={(e) => { e.currentTarget.disabled = true; handleSubmit(); }} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default DownloadsPage;
