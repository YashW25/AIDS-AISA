import { useState } from 'react';
import { Inbox, Loader2, CheckCheck, Trash2, User, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TeacherMessagesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['teacher-messages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('teacher_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
          return '__SETUP_NEEDED__' as any;
        }
        console.error(error);
        return [];
      }
      return data || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('teacher_messages')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-messages'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('teacher_messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
      if (selectedId === deleteMutation.variables) setSelectedId(null);
      toast.success('Message deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from('teacher_messages')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-messages'] });
      toast.success('All messages marked as read');
    },
  });

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Setup needed banner
  if (messages === '__SETUP_NEEDED__') {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-foreground">Teacher Messages</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-6">
          <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">One-time database setup needed</p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
            Run the following SQL in <strong>Supabase Dashboard → SQL Editor</strong> to create the messages table:
          </p>
          <code className="block bg-amber-100 dark:bg-amber-950 rounded-lg p-3 text-xs font-mono text-amber-900 dark:text-amber-200">
            supabase/teacher_messages.sql
          </code>
        </div>
      </div>
    );
  }

  const filtered = (messages as any[]).filter((m: any) =>
    !search ||
    m.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = (messages as any[]).filter((m: any) => !m.is_read).length;
  const selected = (messages as any[]).find((m: any) => m.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Inbox className="h-7 w-7 text-primary" />
            Teacher Messages
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Requests and messages sent by teachers</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by teacher name, subject or content..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-messages"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? 'No messages match your search.' : 'No messages from teachers yet.'}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
          {/* Message list */}
          <div className="space-y-2">
            {filtered.map((msg: any) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  if (!msg.is_read) markReadMutation.mutate(msg.id);
                }}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedId === msg.id
                    ? 'border-primary bg-primary/5'
                    : msg.is_read
                      ? 'border-border bg-card hover:bg-muted/50'
                      : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                }`}
                data-testid={`button-message-${msg.id}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate">
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {msg.teacher_name || msg.teacher_email}
                  </div>
                  {!msg.is_read && (
                    <span className="shrink-0 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className={`text-sm truncate ${msg.is_read ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                  {msg.subject}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(msg.created_at)}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          {selected ? (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 sticky top-24">
              {/* Meta */}
              <div className="space-y-1 pb-4 border-b border-border">
                <h2 className="font-semibold text-lg text-foreground">{selected.subject}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selected.teacher_name}</span>
                  {selected.teacher_email && (
                    <span className="text-xs">({selected.teacher_email})</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(selected.created_at)}
                </p>
              </div>

              {/* Body */}
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                {!selected.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => markReadMutation.mutate(selected.id)}
                    disabled={markReadMutation.isPending}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-msg-${selected.id}`}
                >
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center rounded-xl border border-dashed border-border h-64">
              <p className="text-muted-foreground text-sm">Select a message to read it</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherMessagesPage;
