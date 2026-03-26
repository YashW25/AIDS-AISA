import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Image as ImageIcon, FolderOpen, Link2, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DriveFolderInput } from '@/components/admin/DriveFolderInput';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import type { GalleryItem, Event, Occasion } from '@/types/database';
import { format } from 'date-fns';

const galleryCategories = [
  { value: 'general', label: 'General' },
  { value: 'events', label: 'Events' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'celebrations', label: 'Celebrations' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'technical', label: 'Technical' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'cultural', label: 'Cultural' },
];

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

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  
  // Gallery state
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');

  // Occasion state
  const [occasionModalOpen, setOccasionModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
  const [occasionCategoryFilter, setOccasionCategoryFilter] = useState('all');

  // Gallery data
  const { data: galleryData = [], isLoading: galleryLoading } = useAdminFetch<GalleryItem>('gallery', 'admin-gallery');
  const createGalleryMutation = useAdminCreate<GalleryItem>('gallery', 'admin-gallery');
  const updateGalleryMutation = useAdminUpdate<GalleryItem>('gallery', 'admin-gallery');
  const deleteGalleryMutation = useAdminDelete('gallery', 'admin-gallery');

  // Occasion data
  const { data: occasionData = [], isLoading: occasionLoading } = useAdminFetch<Occasion>('occasions', 'admin-occasions');
  const createOccasionMutation = useAdminCreate<Occasion>('occasions', 'admin-occasions');
  const updateOccasionMutation = useAdminUpdate<Occasion>('occasions', 'admin-occasions');
  const deleteOccasionMutation = useAdminDelete('occasions', 'admin-occasions');

  // Events for reference
  const { data: eventsData } = useAdminFetch<Event>('events', 'events-for-gallery', 'event_date', false);
  const events = eventsData || [];

  // Gallery form
  const galleryForm = useForm<Partial<GalleryItem>>();

  // Occasion form
  const occasionForm = useForm<Partial<Occasion>>();

  // Filter gallery by category
  const filteredGalleryData = useMemo(() => {
    if (galleryCategoryFilter === 'all') return galleryData;
    return galleryData.filter(item => item.category === galleryCategoryFilter);
  }, [galleryData, galleryCategoryFilter]);

  // Filter occasions by category
  const filteredOccasionData = useMemo(() => {
    if (occasionCategoryFilter === 'all') return occasionData;
    return occasionData.filter(item => item.category === occasionCategoryFilter);
  }, [occasionData, occasionCategoryFilter]);

  // Get counts per category for occasions
  const occasionCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    occasionData.forEach(item => {
      const cat = item.category || 'celebration';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [occasionData]);

  // Gallery modal handlers
  const openGalleryModal = (item?: GalleryItem) => {
    setEditingGalleryItem(item || null);
    galleryForm.reset(item || { title: '', image_url: '', drive_folder_link: '', category: 'general', position: 0, is_active: true });
    setGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalOpen(false);
    setEditingGalleryItem(null);
    galleryForm.reset({});
  };

  const onGallerySubmit = async (formData: Partial<GalleryItem>) => {
    if (editingGalleryItem) {
      await updateGalleryMutation.mutateAsync({ ...formData, id: editingGalleryItem.id });
    } else {
      await createGalleryMutation.mutateAsync(formData);
    }
    closeGalleryModal();
  };

  const handleGalleryToggleActive = async (id: string, isActive: boolean) => {
    await updateGalleryMutation.mutateAsync({ id, is_active: isActive });
  };

  // Occasion modal handlers
  const openOccasionModal = (item?: Occasion) => {
    setEditingOccasion(item || null);
    occasionForm.reset(item || { 
      title: '', 
      description: '', 
      category: 'celebration', 
      cover_image_url: '', 
      drive_folder_link: '',
      position: 0, 
      is_active: true 
    });
    setOccasionModalOpen(true);
  };

  const closeOccasionModal = () => {
    setOccasionModalOpen(false);
    setEditingOccasion(null);
    occasionForm.reset({});
  };

  const onOccasionSubmit = async (formData: Partial<Occasion>) => {
    if (editingOccasion) {
      await updateOccasionMutation.mutateAsync({ ...formData, id: editingOccasion.id });
    } else {
      await createOccasionMutation.mutateAsync(formData);
    }
    closeOccasionModal();
  };

  const handleOccasionToggleActive = async (id: string, isActive: boolean) => {
    await updateOccasionMutation.mutateAsync({ id, is_active: isActive });
  };

  // Gallery columns
  const galleryColumns = [
    { key: 'image_url', label: 'Image/Folder', render: (item: GalleryItem) => (
      item.image_url ? (
        <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
      ) : item.drive_folder_link ? (
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center" title="Drive Folder Linked">
          <FolderOpen className="w-6 h-6 text-muted-foreground" />
        </div>
      ) : (
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground" />
        </div>
      )
    )},
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (item: GalleryItem) => (
      <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary text-xs">{item.category}</span>
    )},
    { key: 'position', label: 'Position' },
  ];

  // Occasion columns
  const occasionColumns = [
    { 
      key: 'cover_image_url', 
      label: 'Cover', 
      render: (item: Occasion) => item.cover_image_url ? (
        <img src={item.cover_image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
      ) : (
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground" />
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
        <span className="text-green-600 text-xs flex items-center gap-1">
          <Link2 className="w-3 h-3" /> Linked
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">No gallery</span>
      )
    },
  ];

  // Stats for overview
  const eventsWithGallery = events.filter(e => e.drive_folder_link).length;
  const occasionsWithGallery = occasionData.filter(o => o.drive_folder_link).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Gallery Management</h1>
        <p className="text-muted-foreground">Manage photo galleries, occasions, and event images</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gallery Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{galleryData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occasions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occasionData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events with Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsWithGallery}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drive Linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{occasionsWithGallery + eventsWithGallery}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Photo Gallery
          </TabsTrigger>
          <TabsTrigger value="occasions" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Occasions
          </TabsTrigger>
          <TabsTrigger value="from-events" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            From Events
            {eventsWithGallery > 0 && (
              <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{eventsWithGallery}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Photo Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={galleryCategoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGalleryCategoryFilter('all')}
            >
              All ({galleryData.length})
            </Button>
            {galleryCategories.map(cat => {
              const count = galleryData.filter(item => item.category === cat.value).length;
              if (count === 0) return null;
              return (
                <Button
                  key={cat.value}
                  variant={galleryCategoryFilter === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGalleryCategoryFilter(cat.value)}
                >
                  {cat.label} ({count})
                </Button>
              );
            })}
          </div>

          <AdminTable
            title=""
            data={filteredGalleryData}
            columns={galleryColumns}
            onAdd={() => openGalleryModal()}
            onEdit={openGalleryModal}
            onDelete={(id) => deleteGalleryMutation.mutate(id)}
            onToggleActive={handleGalleryToggleActive}
            isLoading={galleryLoading}
          />
        </TabsContent>

        {/* Occasions Tab */}
        <TabsContent value="occasions" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={occasionCategoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOccasionCategoryFilter('all')}
            >
              All ({occasionData.length})
            </Button>
            {occasionCategories.map(cat => {
              const count = occasionCategoryCounts[cat.value] || 0;
              if (count === 0) return null;
              return (
                <Button
                  key={cat.value}
                  variant={occasionCategoryFilter === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOccasionCategoryFilter(cat.value)}
                >
                  {cat.label} ({count})
                </Button>
              );
            })}
          </div>

          <AdminTable
            title=""
            data={filteredOccasionData}
            columns={occasionColumns}
            onAdd={() => openOccasionModal()}
            onEdit={openOccasionModal}
            onDelete={(id) => deleteOccasionMutation.mutate(id)}
            onToggleActive={handleOccasionToggleActive}
            isLoading={occasionLoading}
          />
        </TabsContent>

        {/* From Events Tab */}
        <TabsContent value="from-events" className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Auto-Linked from Events</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Any event with a Google Drive folder link is <strong>automatically shown</strong> in the public Gallery page under the "Events" tab. To add or change a Drive link, edit the event from the <strong>Events</strong> admin page.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Event</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Gallery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{event.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {event.event_date ? format(new Date(event.event_date), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary text-xs">{event.event_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        {event.drive_folder_link ? (
                          <span className="text-green-600 text-xs flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Showing in Gallery
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />
                            No Drive link — not in Gallery
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Gallery Modal */}
      <FormModal
        title={editingGalleryItem ? 'Edit Gallery Image' : 'Add Gallery Image'}
        open={galleryModalOpen}
        onClose={closeGalleryModal}
      >
        <form onSubmit={galleryForm.handleSubmit(onGallerySubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...galleryForm.register('title', { required: 'Title is required' })} />
            {galleryForm.formState.errors.title && <p className="text-sm text-destructive">{galleryForm.formState.errors.title.message}</p>}
          </div>
          <div className="p-4 border border-border rounded-lg space-y-4">
            <div className="space-y-2">
              <Label>Image / Folder Thumbnail</Label>
              <p className="text-xs text-muted-foreground mb-2">Upload a single photo, or provide a cover thumbnail if linking a Drive folder.</p>
              <ImageUpload
                value={galleryForm.watch('image_url') || ''}
                onChange={(url) => {
                  galleryForm.setValue('image_url', url);
                  if (url) galleryForm.setValue('drive_folder_link', '');
                }}
                folder="gallery"
                fileName={galleryForm.watch('title') || ''}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold pr-2 pl-2">Optional: Link Drive Folder</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-2">
              <DriveFolderInput
                value={galleryForm.watch('drive_folder_link') || ''}
                onChange={(url) => {
                  galleryForm.setValue('drive_folder_link', url);
                  if (url) galleryForm.setValue('image_url', '');
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={galleryForm.watch('category') || 'general'} onValueChange={(v) => galleryForm.setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {galleryCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" type="number" {...galleryForm.register('position', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeGalleryModal} disabled={galleryForm.formState.isSubmitting || createGalleryMutation.isPending || updateGalleryMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={galleryForm.formState.isSubmitting || createGalleryMutation.isPending || updateGalleryMutation.isPending}>
              {(galleryForm.formState.isSubmitting || createGalleryMutation.isPending || updateGalleryMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingGalleryItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Occasion Modal */}
      <FormModal
        title={editingOccasion ? 'Edit Occasion' : 'Add Occasion'}
        open={occasionModalOpen}
        onClose={closeOccasionModal}
      >
        <form onSubmit={occasionForm.handleSubmit(onOccasionSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="occasion-title">Title *</Label>
            <Input id="occasion-title" placeholder="e.g., Farewell 2024" {...occasionForm.register('title', { required: 'Title is required' })} />
            {occasionForm.formState.errors.title && <p className="text-sm text-destructive">{occasionForm.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the occasion" {...occasionForm.register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={occasionForm.watch('category') || 'celebration'} onValueChange={(v) => occasionForm.setValue('category', v)}>
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
              <Input id="occasion_date" type="date" {...occasionForm.register('occasion_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              value={occasionForm.watch('cover_image_url') || ''}
              onChange={(url) => occasionForm.setValue('cover_image_url', url)}
              folder="occasions"
              fileName={occasionForm.watch('title') || ''}
            />
          </div>

          <div className="space-y-2">
            <DriveFolderInput
              value={occasionForm.watch('drive_folder_link') || ''}
              onChange={(url) => occasionForm.setValue('drive_folder_link', url)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion-position">Position</Label>
            <Input id="occasion-position" type="number" {...occasionForm.register('position', { valueAsNumber: true })} />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeOccasionModal} disabled={occasionForm.formState.isSubmitting || createOccasionMutation.isPending || updateOccasionMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={occasionForm.formState.isSubmitting || createOccasionMutation.isPending || updateOccasionMutation.isPending}>
              {(occasionForm.formState.isSubmitting || createOccasionMutation.isPending || updateOccasionMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingOccasion ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default GalleryPage;