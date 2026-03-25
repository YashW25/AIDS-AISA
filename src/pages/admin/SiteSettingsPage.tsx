import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useSiteSettings } from '@/hooks/useSiteData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SiteSettings } from '@/types/database';

type SettingsFormData = Partial<SiteSettings>;

const SiteSettingsPage = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { isDirty } } = useForm<SettingsFormData>();

  useEffect(() => {
    if (settings) {
      reset({
        club_name: settings.club_name,
        club_full_name: settings.club_full_name,
        college_name: settings.college_name,
        logo_url: settings.logo_url,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        linkedin_url: settings.linkedin_url,
        youtube_url: settings.youtube_url,
        twitter_url: settings.twitter_url,
      });
    }
  }, [settings, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      if (!settings?.id) {
        // Insert new settings
        const { error } = await supabase
          .from('site_settings')
          .insert(data as any);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Manage your site information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          <h2 className="font-display text-xl font-semibold">Logo</h2>
          <div className="max-w-xs">
            <ImageUpload
              value={watch('logo_url') || ''}
              onChange={(url) => setValue('logo_url', url, { shouldDirty: true })}
              folder="logos"
              fileName="site-logo"
            />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          <h2 className="font-display text-xl font-semibold">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="club_name">Club Name (Short)</Label>
              <Input id="club_name" {...register('club_name')} placeholder="AISA Club" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club_full_name">Club Full Name</Label>
              <Input id="club_full_name" {...register('club_full_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college_name">College Name</Label>
              <Input id="college_name" {...register('college_name')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea id="tagline" {...register('tagline')} rows={3} />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          <h2 className="font-display text-xl font-semibold">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register('address')} rows={2} />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          <h2 className="font-display text-xl font-semibold">Social Media Links</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook</Label>
              <Input id="facebook_url" {...register('facebook_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input id="instagram_url" {...register('instagram_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input id="linkedin_url" {...register('linkedin_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube</Label>
              <Input id="youtube_url" {...register('youtube_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter/X</Label>
              <Input id="twitter_url" {...register('twitter_url')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || updateMutation.isPending} size="lg">
            {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsPage;
