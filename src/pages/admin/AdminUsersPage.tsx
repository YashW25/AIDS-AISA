import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Shield, ShieldCheck, UserPlus, Info, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTable } from '@/components/admin/AdminTable';
import { FormModal } from '@/components/admin/FormModal';
import { useAdmins } from '@/hooks/useAdminData';
import { useClub } from '@/contexts/ClubContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { ClubAdmin } from '@/types/database';
import { z } from 'zod';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();

const newAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'teacher']),
});

const SQL_SETUP = `-- Paste & run this ONCE in your Supabase SQL Editor.
-- It creates users directly in the database — no emails sent, no rate limits.

CREATE OR REPLACE FUNCTION public.create_admin_user_direct(
  p_email text, p_password text, p_full_name text,
  p_role text, p_club_id uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, extensions AS $$
DECLARE v_user_id uuid; v_db_role app_role; v_profile_role text; BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(p_email);
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', lower(p_email),
      crypt(p_password, gen_salt('bf')), now(),
      jsonb_build_object('full_name', p_full_name),
      '{"provider":"email","providers":["email"]}'::jsonb,
      now(), now(), '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', lower(p_email)),
      'email', lower(p_email), now(), now(), now()
    );
  END IF;
  v_db_role      := CASE p_role WHEN 'teacher' THEN 'teacher'::app_role ELSE 'admin'::app_role END;
  v_profile_role := CASE p_role WHEN 'teacher' THEN 'editor' ELSE 'admin' END;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, v_db_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
    VALUES (v_user_id, lower(p_email), p_full_name, v_profile_role, true)
    ON CONFLICT (id) DO UPDATE SET full_name=EXCLUDED.full_name, role=EXCLUDED.role, is_active=true;
  IF p_club_id IS NOT NULL THEN
    INSERT INTO public.club_admins (club_id, user_id, role, is_primary)
      VALUES (p_club_id, v_user_id, p_role, false) ON CONFLICT (club_id, user_id) DO NOTHING;
  END IF;
  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END; $$;

GRANT EXECUTE ON FUNCTION public.create_admin_user_direct TO authenticated;`;

const AdminUsersPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const queryClient = useQueryClient();
  const { clubId } = useClub();

  const { data = [], isLoading } = useAdmins();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    email: string; password: string; full_name: string; role: 'admin' | 'teacher';
  }>({ defaultValues: { role: 'admin' } });

  const createAdminMutation = useMutation({
    mutationFn: async (formData: { email: string; password: string; full_name: string; role: string }) => {
      // Call the SECURITY DEFINER function — creates auth user + assigns role in one step.
      // No email is sent. No rate limits. Works every time.
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_admin_user_direct' as any, {
        p_email: formData.email,
        p_password: formData.password,
        p_full_name: formData.full_name,
        p_role: formData.role,
        p_club_id: clubId || null,
      });

      if (rpcError) {
        if (rpcError.code === '42883' || rpcError.message?.toLowerCase().includes('function')) {
          throw new Error('SQL_SETUP_NEEDED');
        }
        throw new Error(rpcError.message);
      }

      return rpcData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Account created! They can log in immediately with the password you set.');
      closeModal();
    },
    onError: (error: Error) => {
      if (error.message === 'SQL_SETUP_NEEDED') {
        toast.error('Run the SQL setup first — see the instructions on this page.');
      } else {
        toast.error(error.message);
      }
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('club_admins').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openModal = () => {
    reset({ email: '', password: '', full_name: '', role: 'admin' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); reset({}); };

  const onSubmit = async (formData: any) => {
    const validation = newAdminSchema.safeParse(formData);
    if (!validation.success) { toast.error(validation.error.errors[0].message); return; }
    createAdminMutation.mutate(formData);
  };

  const copySql = async () => {
    await navigator.clipboard.writeText(SQL_SETUP);
    setSqlCopied(true);
    toast.success('SQL copied to clipboard!');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const projectRef = SUPABASE_URL.split('//')[1]?.split('.')[0] || '';

  const columns: { key: string; label: string; render?: (item: ClubAdmin) => React.ReactNode }[] = [
    { key: 'user_id', label: 'User ID' },
    {
      key: 'role', label: 'Role', render: (item: ClubAdmin) => (
        <div className="flex items-center gap-2">
          {item.role === 'admin'
            ? <ShieldCheck className="h-4 w-4 text-primary" />
            : <Shield className="h-4 w-4 text-muted-foreground" />}
          <span className="capitalize">{item.role}</span>
        </div>
      )
    },
    { key: 'is_primary', label: 'Primary', render: (item: ClubAdmin) => <span>{item.is_primary ? 'Yes' : 'No'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Club Admins &amp; Teachers</h1>
        <p className="text-muted-foreground">Add and manage admin/teacher accounts — no email confirmation needed</p>
      </div>

      {/* One-time SQL setup */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              One-time SQL setup required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Run the SQL below <strong>once</strong> in your{' '}
              <a
                href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Supabase SQL Editor ↗
              </a>
              {'. '}
              After that, admin/teacher accounts can be created instantly — no emails, no rate limits, no extra steps.
            </p>
          </div>
        </div>
        <div className="relative">
          <pre className="text-xs bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 pr-24 overflow-x-auto max-h-40 text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-5">
            {SQL_SETUP}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 gap-1.5 text-xs border-amber-300 bg-white dark:bg-black/40 hover:bg-amber-50"
            onClick={copySql}
          >
            {sqlCopied
              ? <><CheckCheck className="w-3.5 h-3.5 text-green-600" />Copied</>
              : <><Copy className="w-3.5 h-3.5" />Copy SQL</>}
          </Button>
        </div>
      </div>

      <AdminTable
        title=""
        data={data}
        columns={columns}
        onAdd={openModal}
        onEdit={() => toast.info('Edit not available for club admins')}
        onDelete={(id) => removeAdminMutation.mutate(id)}
        isLoading={isLoading}
      />

      <FormModal title="Add New Admin / Teacher" open={modalOpen} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...register('full_name', { required: true })} placeholder="e.g. Prof. Rahul Sharma" />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email', { required: true })} placeholder="user@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" {...register('password', { required: true })} placeholder="Min 8 characters" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            <p className="text-xs text-muted-foreground">
              They can log in immediately with this password. No email confirmation needed.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select defaultValue="admin" onValueChange={(v) => setValue('role', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="teacher">Teacher — limited access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createAdminMutation.isPending} className="gap-2">
              {createAdminMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default AdminUsersPage;
