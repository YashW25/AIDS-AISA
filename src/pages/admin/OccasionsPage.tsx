import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DriveFolderInput } from '@/components/admin/DriveFolderInput';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import type { Occasion } from '@/types/database';
import { format } from 'date-fns';

const occasionCategories = [
  { value: 'farewell', label: 'Farewell' },
  { value: 'teachers_day', label: 'Teachers Day' },
  { value: 'welcome', label: 'Welcome Ceremony' },
  { value: 'annual_day', label: 'Annual Day' },
  { value: 'festival', label: 'Festival' },
  { value: 'sports_day', label: 'Sports Day' },
  { value: 'cultural', label: 'Cultural Day' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'other', label: 'Other' },
];

const OccasionsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Occasion | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data = [], isLoading } = useAdminFetch<Occasion>('occasions', 'admin-occasions');
  const createMutation = useAdminCreate<Occasion>('occasions', 'admin-occasions');
  const updateMutation = useAdminUpdate<Occasion>('occasions', 'admin-occasions');
  const deleteMutation = useAdminDelete('occasions', 'admin-occasions');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<Partial<Occasion>>();

  // Filter occasions by category
  const filteredData = useMemo(() => {
    if (categoryFilter === 'all') return data;
    return data.filter(item => item.category === categoryFilter);
  }, [data, categoryFilter]);

  // Get counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const cat = item.category || 'celebration';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [data]);

  const openModal = (item?: Occasion) => {
    setEditingItem(item || null);
    reset(item || { 
      title: '', 
      description: '', 
      category: 'celebration', 
      cover_image_url: '', 
      drive_folder_link: '',
      position: 0, 
      is_active: true 
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<Occasion>) => {
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
    { 
      key: 'cover_image_url', 
      label: 'Cover', 
      render: (item: Occasion) => item.cover_image_url ? (
        <img src={item.cover_image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
      ) : (
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
          <Calendar className="w-6 h-6 text-muted-foreground" />
        </div>
      )
    },
    { key: 'title', label: 'Title' },
    { 
      key: 'category', 
      label: 'Category', 
      render: (item: Occasion) => (
        <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary text-xs">
          {occasionCategories.find(c => c.value === item.category)?.label || item.category}
        </span>
      )
    },
    { 
      key: 'occasion_date', 
      label: 'Date', 
      render: (item: Occasion) => item.occasion_date ? format(new Date(item.occasion_date), 'MMM dd, yyyy') : '-'
    },
    { 
      key: 'drive_folder_link', 
      label: 'Gallery', 
      render: (item: Occasion) => item.drive_folder_link ? (
        <span className="text-green-600 text-xs">✓ Linked</span>
      ) : (
        <span className="text-muted-foreground text-xs">No gallery</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Occasions</h1>
        <p className="text-muted-foreground">Manage occasions like farewells, teachers day, cultural events</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('all')}
        >
          All ({data.length})
        </Button>
        {occasionCategories.map(cat => {
          const count = categoryCounts[cat.value] || 0;
          if (count === 0) return null;
          return (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat.value)}
            >
              {cat.label} ({count})
            </Button>
          );
        })}
      </div>

      <AdminTable
        title=""
        data={filteredData}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={openModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleActive={handleToggleActive}
        isLoading={isLoading}
      />

      <FormModal
        title={editingItem ? 'Edit Occasion' : 'Add Occasion'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="e.g., Farewell 2024" {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the occasion" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={watch('category') || 'celebration'} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {occasionCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occasion_date">Date</Label>
              <Input id="occasion_date" type="date" {...register('occasion_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              value={watch('cover_image_url') || ''}
              onChange={(url) => setValue('cover_image_url', url)}
              folder="occasions"
              fileName={watch('title') || ''}
            />
          </div>

          <div className="space-y-2">
            <DriveFolderInput
              value={watch('drive_folder_link') || ''}
              onChange={(url) => setValue('drive_folder_link', url)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" type="number" {...register('position', { valueAsNumber: true })} />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
              {(isSubmitting || createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default OccasionsPage;
