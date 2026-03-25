import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DriveFolderInput } from '@/components/admin/DriveFolderInput';
import { useAdminFetch, useAdminCreate, useAdminUpdate, useAdminDelete } from '@/hooks/useAdminData';
import type { Event } from '@/types/database';

const EventsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data = [], isLoading } = useAdminFetch<Event>('events', 'admin-events', 'event_date', false);
  const createMutation = useAdminCreate<Event>('events', 'admin-events');
  const updateMutation = useAdminUpdate<Event>('events', 'admin-events');
  const deleteMutation = useAdminDelete('events', 'admin-events');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<Partial<Event>>();

  // Split events into upcoming and past
  const now = new Date();
  const upcomingEvents = data.filter(e => new Date(e.event_date) >= now);
  const pastEvents = data.filter(e => new Date(e.event_date) < now);

  const openModal = (item?: Event) => {
    setEditingItem(item || null);
    if (item) {
      reset({
        ...item,
        event_date: item.event_date ? format(new Date(item.event_date), "yyyy-MM-dd'T'HH:mm") : '',
        drive_folder_link: item.drive_folder_link || '',
      });
    } else {
      reset({ title: '', description: '', event_type: 'technical', location: '', max_participants: 50, is_active: true, drive_folder_link: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset({});
  };

  const onSubmit = async (formData: Partial<Event>) => {
    const payload = {
      ...formData,
      event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      drive_folder_link: formData.drive_folder_link || null,
    };
    if (editingItem) {
      await updateMutation.mutateAsync({ ...payload, id: editingItem.id });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, is_active: isActive });
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'event_type', label: 'Type', render: (item: Event) => (
      <span className="capitalize px-2 py-1 rounded bg-primary/10 text-primary text-xs">{item.event_type}</span>
    )},
    { key: 'event_date', label: 'Date', render: (item: Event) => (
      <span>{item.event_date ? format(new Date(item.event_date), 'PPP') : '-'}</span>
    )},
    { key: 'location', label: 'Location' },
    { key: 'max_participants', label: 'Registered', render: (item: Event) => (
      <span>{item.current_participants}/{item.max_participants || '∞'}</span>
    )},
    { key: 'actual_participants', label: 'Participated', render: (item: Event) => (
      <span className="text-accent font-medium">{(item as any).actual_participants || 0}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Events</h1>
        <p className="text-muted-foreground">Manage club events</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <AdminTable
            title=""
            data={upcomingEvents}
            columns={columns}
            onAdd={() => openModal()}
            onEdit={openModal}
            onDelete={(id) => deleteMutation.mutate(id)}
            onToggleActive={handleToggleActive}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          <AdminTable
            title=""
            data={pastEvents}
            columns={columns}
            onAdd={() => openModal()}
            onEdit={openModal}
            onDelete={(id) => deleteMutation.mutate(id)}
            onToggleActive={handleToggleActive}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <FormModal
        title={editingItem ? 'Edit Event' : 'Add Event'}
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select defaultValue={watch('event_type') || 'technical'} onValueChange={(v) => setValue('event_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input id="event_date" type="datetime-local" {...register('event_date', { required: 'Date is required' })} />
              {errors.event_date && <p className="text-sm text-destructive">{errors.event_date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="Seminar Hall" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input id="max_participants" type="number" {...register('max_participants', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
              <Input id="entry_fee" type="number" step="0.01" {...register('entry_fee', { valueAsNumber: true })} placeholder="0 for free events" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_participants">Actual Participants</Label>
              <Input id="actual_participants" type="number" {...register('actual_participants' as any, { valueAsNumber: true })} placeholder="Manually update after event" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Event Thumbnail</Label>
            <ImageUpload
              value={watch('image_url') || ''}
              onChange={(url) => setValue('image_url', url)}
              folder="events"
              fileName={watch('title') || ''}
            />
          </div>
          <DriveFolderInput
            value={watch('drive_folder_link') || ''}
            onChange={(url) => setValue('drive_folder_link', url)}
          />
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

export default EventsPage;
