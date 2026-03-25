import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import type { HeroSlide } from '@/types/database';

const HeroSlidesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroSlide | null>(null);

  const { data = [], isLoading } = useAdminFetch<HeroSlide>('hero_slides', 'admin-hero-slides');
  const createMutation = useAdminCreate<HeroSlide>('hero_slides', 'admin-hero-slides');
  const updateMutation = useAdminUpdate<HeroSlide>('hero_slides', 'admin-hero-slides');
  const deleteMutation = useAdminDelete('hero_slides', 'admin-hero-slides');

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<Partial<HeroSlide>>();

  const openModal = (item?: HeroSlide) => {
    setEditingItem(item || null);
    reset(item || { title: '', subtitle: '', image_url: '', button_text: '', button_link: '', position: 0, is_active: true });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<HeroSlide>) => {
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
    { key: 'image_url', label: 'Image', render: (item: HeroSlide) => (
      <img 
        src={item.image_url} 
        alt={item.title} 
        className="w-20 h-12 object-cover rounded"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
    )},
    { key: 'title', label: 'Title' },
    { key: 'button_text', label: 'Button' },
    { key: 'position', label: 'Position' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Hero Slider</h1>
        <p className="text-muted-foreground">Manage hero section slides</p>
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
        title={editingItem ? 'Edit Slide' : 'Add Slide'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea id="subtitle" {...register('subtitle')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Image *</Label>
            <Controller
              name="image_url"
              control={control}
              rules={{ required: 'Image is required' }}
              render={({ field }) => (
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  folder="hero-slides"
                  fileName={editingItem?.title || ''}
                />
              )}
            />
            {errors.image_url && <p className="text-sm text-destructive">{errors.image_url.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Button Text</Label>
              <Input id="button_text" {...register('button_text')} placeholder="Learn More" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_link">Button Link</Label>
              <Input id="button_link" {...register('button_link')} placeholder="/about" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" type="number" {...register('position', { valueAsNumber: true })} />
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

export default HeroSlidesPage;
