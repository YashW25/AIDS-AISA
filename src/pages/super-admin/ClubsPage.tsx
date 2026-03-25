import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, Globe, Palette, PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/admin/FormModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useAllClubs, useCreateClub, useUpdateClub, useDeleteClub } from '@/hooks/useClubAdminData';
import { Club } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface ExtendedClub extends Club {
  is_suspended?: boolean;
  suspension_reason?: string | null;
}

type ClubFormData = Omit<Club, 'id' | 'created_at' | 'updated_at'>;

const ClubsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ExtendedClub | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<ExtendedClub | null>(null);
  const [clubToSuspend, setClubToSuspend] = useState<ExtendedClub | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const { data: clubs = [], isLoading } = useAllClubs();
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();
  const queryClient = useQueryClient();

  const suspendClubMutation = useMutation({
    mutationFn: async ({ clubId, suspend, reason }: { clubId: string; suspend: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('clubs')
        .update({ 
          is_suspended: suspend, 
          suspension_reason: suspend ? reason : null 
        })
        .eq('id', clubId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-clubs'] });
      toast.success(variables.suspend ? 'Club suspended successfully' : 'Club resumed successfully');
      setSuspendDialogOpen(false);
      setClubToSuspend(null);
      setSuspensionReason('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { register, handleSubmit, reset, control, setValue, watch } = useForm<ClubFormData>({
    defaultValues: {
      is_active: true,
      primary_color: '#3b82f6',
      secondary_color: '#f59e0b',
      gradient_from: '#0f172a',
      gradient_via: '#1e3a5f',
      gradient_to: '#2563eb',
    }
  });

  const openModal = (club?: ExtendedClub) => {
    if (club) {
      setEditingClub(club);
      reset({
        name: club.name,
        full_name: club.full_name,
        slug: club.slug,
        college_name: club.college_name,
        logo_url: club.logo_url,
        tagline: club.tagline,
        email: club.email,
        phone: club.phone,
        address: club.address,
        facebook_url: club.facebook_url,
        instagram_url: club.instagram_url,
        linkedin_url: club.linkedin_url,
        youtube_url: club.youtube_url,
        twitter_url: club.twitter_url,
        primary_domain: club.primary_domain,
        staging_domain: club.staging_domain,
        primary_color: club.primary_color,
        secondary_color: club.secondary_color,
        gradient_from: club.gradient_from,
        gradient_via: club.gradient_via,
        gradient_to: club.gradient_to,
        is_active: club.is_active,
      });
    } else {
      setEditingClub(null);
      reset({
        name: '',
        full_name: '',
        slug: '',
        college_name: 'AI&DS Department',
        logo_url: null,
        tagline: '',
        email: '',
        phone: '',
        address: '',
        facebook_url: null,
        instagram_url: null,
        linkedin_url: null,
        youtube_url: null,
        twitter_url: null,
        primary_domain: null,
        staging_domain: null,
        primary_color: '#3b82f6',
        secondary_color: '#f59e0b',
        gradient_from: '#0f172a',
        gradient_via: '#1e3a5f',
        gradient_to: '#2563eb',
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClub(null);
    reset({});
  };

  const onSubmit = async (data: ClubFormData) => {
    try {
      if (editingClub) {
        await updateClub.mutateAsync({ id: editingClub.id, ...data });
      } else {
        await createClub.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = (club: ExtendedClub) => {
    setClubToDelete(club);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (clubToDelete) {
      await deleteClub.mutateAsync(clubToDelete.id);
      setDeleteDialogOpen(false);
      setClubToDelete(null);
    }
  };

  const handleToggleActive = async (club: ExtendedClub) => {
    await updateClub.mutateAsync({ id: club.id, is_active: !club.is_active });
  };

  const handleSuspendClick = (club: ExtendedClub) => {
    setClubToSuspend(club);
    setSuspensionReason(club.suspension_reason || 'Website has been suspended due to pending payment. Please contact the administrator to restore access.');
    setSuspendDialogOpen(true);
  };

  const confirmSuspend = () => {
    if (clubToSuspend) {
      const isSuspending = !clubToSuspend.is_suspended;
      suspendClubMutation.mutate({
        clubId: clubToSuspend.id,
        suspend: isSuspending,
        reason: isSuspending ? suspensionReason : undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Clubs</h1>
          <p className="text-muted-foreground">Manage all clubs in the system</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(clubs as ExtendedClub[]).map((club) => (
          <Card key={club.id} className={`relative ${club.is_suspended ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            {club.is_suspended && (
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-destructive/20 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Suspended
                </span>
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: club.primary_color || '#3b82f6' }}
                    >
                      {club.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{club.slug}</p>
                  </div>
                </div>
                {!club.is_suspended && (
                  <span className={`px-2 py-1 text-xs rounded-full ${club.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {club.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{club.full_name}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="truncate">{club.staging_domain || 'No domain set'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Palette className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-1">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: club.primary_color || '#3b82f6' }} />
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: club.secondary_color || '#f59e0b' }} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => openModal(club)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant={club.is_suspended ? 'default' : 'outline'}
                  onClick={() => handleSuspendClick(club)}
                  className={club.is_suspended ? 'bg-green-600 hover:bg-green-700' : 'text-orange-600 border-orange-300 hover:bg-orange-50'}
                >
                  {club.is_suspended ? (
                    <>
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3 w-3 mr-1" />
                      Suspend
                    </>
                  )}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(club)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {clubs.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No clubs found. Create your first club to get started.
          </div>
        )}
      </div>

      <FormModal
        title={editingClub ? 'Edit Club' : 'Add New Club'}
        open={modalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Short Name *</Label>
              <Input id="name" placeholder="AISA" {...register('name', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" placeholder="AISA" {...register('slug', { required: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" placeholder="Artificial Intelligence and Data Science Students Association" {...register('full_name', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="college_name">College Name *</Label>
            <Input id="college_name" placeholder="AI&DS Department" {...register('college_name', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <Controller
              name="logo_url"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  folder="logos"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea id="tagline" placeholder="Empowering future tech leaders..." {...register('tagline')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="club@college.in" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+91 1234567890" {...register('phone')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="College address..." {...register('address')} />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Domains</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staging_domain">Staging Domain</Label>
                <Input id="staging_domain" placeholder="AISA-isbmcoe.netlify.app" {...register('staging_domain')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_domain">Primary Domain</Label>
                <Input id="primary_domain" placeholder="AISA.isbmcoe.in" {...register('primary_domain')} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Branding Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input id="primary_color" type="color" className="w-12 h-10 p-1" {...register('primary_color')} />
                  <Input {...register('primary_color')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input id="secondary_color" type="color" className="w-12 h-10 p-1" {...register('secondary_color')} />
                  <Input {...register('secondary_color')} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Social Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input id="facebook_url" placeholder="https://facebook.com/..." {...register('facebook_url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input id="instagram_url" placeholder="https://instagram.com/..." {...register('instagram_url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input id="linkedin_url" placeholder="https://linkedin.com/..." {...register('linkedin_url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input id="youtube_url" placeholder="https://youtube.com/..." {...register('youtube_url')} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-4">
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Club is Active</Label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createClub.isPending || updateClub.isPending}>
              {editingClub ? 'Update Club' : 'Create Club'}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Suspend/Resume Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clubToSuspend?.is_suspended ? 'Resume Club Website' : 'Suspend Club Website'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clubToSuspend?.is_suspended 
                ? `This will restore access to "${clubToSuspend?.name}" website. Users will be able to access the website again.`
                : `This will temporarily suspend "${clubToSuspend?.name}" website. Users will see a suspension notice instead of the website content.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!clubToSuspend?.is_suspended && (
            <div className="space-y-2">
              <Label htmlFor="suspension_reason">Suspension Reason</Label>
              <Textarea 
                id="suspension_reason" 
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Website has been suspended due to pending payment..."
                rows={3}
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSuspend}
              className={clubToSuspend?.is_suspended ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {clubToSuspend?.is_suspended ? 'Resume Website' : 'Suspend Website'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the club "{clubToDelete?.name}" and all its associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClubsPage;