import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';

interface PopupAnnouncement {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean | null;
  position: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const PopupAnnouncementsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PopupAnnouncement | null>(null);

  const { data = [], isLoading } = useAdminFetch<PopupAnnouncement>('popup_announcements', 'admin-popup-announcements');
  const createMutation = useAdminCreate<PopupAnnouncement>('popup_announcements', 'admin-popup-announcements');
  const updateMutation = useAdminUpdate<PopupAnnouncement>('popup_announcements', 'admin-popup-announcements');
  const deleteMutation = useAdminDelete('popup_announcements', 'admin-popup-announcements');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<PopupAnnouncement>>();

  const imageUrl = watch('image_url');

  const openModal = (item?: PopupAnnouncement) => {
    setEditingItem(item || null);
    reset(item || { title: '', image_url: '', link_url: '', link_text: 'Register Now', position: 0, is_active: true });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<PopupAnnouncement>) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ ...formData, id: editingItem.id });
    } else {
      await createMutation.mutateAsync(formData);
    }
    closeModal();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: isActive });
  };

  const columns = [
    { key: 'image_url', label: 'Image', render: (item: PopupAnnouncement) => (
      <img src={item.image_url} alt={item.title} className="w-20 h-12 object-cover rounded" />
    )},
    { key: 'title', label: 'Title' },
    { key: 'link_text', label: 'Button Text' },
    { key: 'position', label: 'Position' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Popup Announcements</h1>
        <p className="text-muted-foreground">Manage homepage popup announcements for events</p>
      </div>

      <AdminTable
        title=""
        data={data}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={openModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={handleToggleActive}
        isLoading={isLoading}
      />

      <FormModal
        title={editingItem ? 'Edit Popup' : 'Add Popup'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Event announcement title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Popup Image *</Label>
            <ImageUpload
              value={imageUrl || ''}
              onChange={(url) => setValue('image_url', url)}
              folder="popups"
              fileName={watch('title') || ''}
            />
            <input type="hidden" {...register('image_url', { required: 'Image is required' })} />
            {errors.image_url && <p className="text-sm text-destructive">{errors.image_url.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                {...register('link_url')}
                placeholder="/events or external URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_text">Button Text</Label>
              <Input
                id="link_text"
                {...register('link_text')}
                placeholder="Register Now"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              {...register('position', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default PopupAnnouncementsPage;
