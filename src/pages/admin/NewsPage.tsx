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
import { Newspaper } from 'lucide-react';
import { format } from 'date-fns';

interface News {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  published_date: string;
  expire_date: string | null;
  is_marquee: boolean;
  is_active: boolean;
  position: number;
}

const NewsPage = () => {
  const { data: news, isLoading } = useAdminFetch<News>('news', 'news');
  const createMutation = useAdminCreate<News>('news', 'news');
  const updateMutation = useAdminUpdate<News>('news', 'news');
  const deleteMutation = useAdminDelete('news', 'news');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    attachment_url: '',
    attachment_type: 'pdf',
    published_date: new Date().toISOString().split('T')[0],
    expire_date: '',
    is_marquee: false,
    is_active: true,
    position: 0,
  });

  const columns = [
    { key: 'title', label: 'Title' },
    { 
      key: 'is_marquee', 
      label: 'Marquee',
      render: (item: News) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.is_marquee ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {item.is_marquee ? 'Yes' : 'No'}
        </span>
      )
    },
    { 
      key: 'published_date', 
      label: 'Published',
      render: (item: News) => item.published_date ? format(new Date(item.published_date), 'MMM dd, yyyy') : '-'
    },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (item: News) => (
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
      content: '',
      image_url: '',
      attachment_url: '',
      attachment_type: 'pdf',
      published_date: new Date().toISOString().split('T')[0],
      expire_date: '',
      is_marquee: false,
      is_active: true,
      position: (news?.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: News) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content || '',
      image_url: item.image_url || '',
      attachment_url: item.attachment_url || '',
      attachment_type: item.attachment_type || 'pdf',
      published_date: item.published_date ? item.published_date.split('T')[0] : '',
      expire_date: item.expire_date ? item.expire_date.split('T')[0] : '',
      is_marquee: item.is_marquee,
      is_active: item.is_active,
      position: item.position,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      published_date: formData.published_date ? new Date(formData.published_date).toISOString() : new Date().toISOString(),
      expire_date: formData.expire_date ? new Date(formData.expire_date).toISOString() : null,
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
        <Newspaper className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">News & Marquee</h1>
          <p className="text-muted-foreground text-sm">Manage news items and marquee announcements (current/upcoming events)</p>
        </div>
      </div>

      <AdminTable
        title="News Items"
        data={news || []}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isLoading={isLoading}
      />

      <FormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit News' : 'Add News'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="News title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="News content..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="news"
              fileName={formData.title || ''}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <ImageUpload
              value={formData.attachment_url}
              onChange={(url) => setFormData({ ...formData, attachment_url: url })}
              folder="news-attachments"
              fileName={formData.title ? `${formData.title}-attachment` : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="published_date">Published Date</Label>
              <Input
                id="published_date"
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expire_date">Expire Date (Optional)</Label>
              <Input
                id="expire_date"
                type="date"
                value={formData.expire_date}
                onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_marquee}
                onCheckedChange={(checked) => setFormData({ ...formData, is_marquee: checked })}
              />
              <Label>Show in Marquee</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
            />
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

export default NewsPage;
