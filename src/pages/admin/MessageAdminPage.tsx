import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SendHorizonal, Loader2, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MessageForm = {
  subject: string;
  category: string;
  message: string;
};

const CATEGORIES = [
  'General Query',
  'Content Update Request',
  'Event Request',
  'Technical Issue',
  'Student Issue',
  'Permission Request',
  'Other',
];

const MessageAdminPage = () => {
  const queryClient = useQueryClient();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MessageForm>({
    defaultValues: { subject: '', category: CATEGORIES[0], message: '' },
  });

  // Fetch current teacher's own messages
  const { data: myMessages = [], isLoading } = useQuery({
    queryKey: ['my-teacher-messages'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from('teacher_messages')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (formData: MessageForm) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error('Not authenticated');

      // Get teacher name from admin_profiles
      const { data: profile } = await (supabase as any)
        .from('admin_profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await (supabase as any).from('teacher_messages').insert({
        teacher_id: user.id,
        teacher_name: (profile as any)?.full_name || user.email,
        teacher_email: (profile as any)?.email || user.email,
        subject: `[${formData.category}] ${formData.subject}`,
        message: formData.message,
        is_read: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teacher-messages'] });
      toast.success('Message sent to admin successfully.');
      reset({ subject: '', category: CATEGORIES[0], message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    },
    onError: (e: Error) => {
      if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
        toast.error('Setup required: run supabase/teacher_messages.sql in your Supabase SQL Editor first.');
      } else {
        toast.error(e.message);
      }
    },
  });

  const onSubmit = (data: MessageForm) => sendMutation.mutate(data);

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Message Admin</h1>
        <p className="text-muted-foreground text-sm">
          Send a request or question to the admin. They will review it in the admin panel.
        </p>
      </div>

      {/* Send form */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <SendHorizonal className="h-5 w-5 text-primary" />
          New Message
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue={CATEGORIES[0]} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...register('subject', { required: 'Subject is required' })}
                placeholder="Brief subject line"
                data-testid="input-subject"
              />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message too short' } })}
              placeholder="Describe your request or question in detail..."
              className="min-h-[120px] resize-none"
              data-testid="textarea-message"
            />
            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={sendMutation.isPending || sent}
              className="gap-2"
              data-testid="button-send-message"
            >
              {sendMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                : sent
                  ? <><CheckCircle2 className="h-4 w-4" /> Sent!</>
                  : <><SendHorizonal className="h-4 w-4" /> Send Message</>}
            </Button>
          </div>
        </form>
      </div>

      {/* My sent messages */}
      <div>
        <h2 className="font-semibold text-base mb-3 text-muted-foreground uppercase tracking-wide text-xs">
          Your Previous Messages
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : myMessages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8 border border-dashed rounded-xl">
            No messages sent yet.
          </p>
        ) : (
          <div className="space-y-3">
            {myMessages.map((msg: any) => (
              <div key={msg.id} className="rounded-xl border border-border bg-card p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-foreground">{msg.subject}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                    msg.is_read ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {msg.is_read ? 'Seen' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(msg.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageAdminPage;
