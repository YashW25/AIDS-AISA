import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Check, X, Search, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  registration_status: string;
  payment_status: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    mobile: string;
    enrollment_number: string;
    branch: string;
    college: string;
    year: string;
  } | null;
  events: {
    id: string;
    title: string;
    entry_fee: number;
  } | null;
  payments: {
    id: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id: string | null;
    receipt_number: string | null;
  }[] | null;
}

interface EventOption {
  id: string;
  title: string;
}

const RegistrationsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  // Fetch events for tabs
  const { data: events = [] } = useQuery<EventOption[]>({
    queryKey: ['admin-events-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('event_date', { ascending: false });
      if (error) {
        console.error('Error fetching events:', error);
        return [] as EventOption[];
      }
      return data;
    },
  });

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (id, title, entry_fee),
          payments (id, amount, payment_method, payment_status, transaction_id, receipt_number)
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching registrations:', error);
        return [] as Registration[];
      }
      
      const userIds = [...new Set(data.map(r => r.user_id))];
      if (userIds.length === 0) return [] as Registration[];
      
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, mobile, enrollment_number, branch, college, year')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(reg => ({
        ...reg,
        user_profiles: profileMap.get(reg.user_id) || null,
      })) as Registration[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ regId, status, paymentId }: { regId: string; status: string; paymentId?: string }) => {
      const regStatus = status === 'confirmed' ? 'confirmed' : 'cancelled';
      const payStatus = status === 'confirmed' ? 'paid' : 'failed';
      
      await supabase
        .from('event_registrations')
        .update({ registration_status: regStatus, payment_status: payStatus })
        .eq('id', regId);

      if (paymentId) {
        await supabase
          .from('payments')
          .update({ payment_status: status === 'confirmed' ? 'completed' : 'failed' })
          .eq('id', paymentId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast({ title: 'Registration updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Group registrations by event
  const registrationsByEvent = useMemo(() => {
    const grouped: Record<string, Registration[]> = {};
    registrations.forEach(reg => {
      const eventId = reg.events?.id || 'unknown';
      if (!grouped[eventId]) grouped[eventId] = [];
      grouped[eventId].push(reg);
    });
    return grouped;
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;
    
    // Filter by event
    if (selectedEventId !== 'all') {
      filtered = filtered.filter(reg => reg.events?.id === selectedEventId);
    }
    
    // Filter by search
    if (search) {
      filtered = filtered.filter(reg => 
        reg.user_profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        reg.user_profiles?.enrollment_number?.toLowerCase().includes(search.toLowerCase()) ||
        reg.events?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.payment_status === statusFilter);
    }
    
    return filtered;
  }, [registrations, selectedEventId, search, statusFilter]);

  const exportToExcel = () => {
    const dataToExport = filteredRegistrations.map(reg => ({
      'Name': reg.user_profiles?.full_name || 'N/A',
      'Mobile': reg.user_profiles?.mobile || 'N/A',
      'Enrollment No': reg.user_profiles?.enrollment_number || 'N/A',
      'Branch': reg.user_profiles?.branch || 'N/A',
      'Year': reg.user_profiles?.year || 'N/A',
      'College': reg.user_profiles?.college || 'N/A',
      'Event': reg.events?.title || 'N/A',
      'Fee': reg.events?.entry_fee || 0,
      'Payment Status': reg.payment_status,
      'Registration Status': reg.registration_status,
      'Payment Method': reg.payments?.[0]?.payment_method || 'N/A',
      'Transaction ID': reg.payments?.[0]?.transaction_id || 'N/A',
      'Receipt Number': reg.payments?.[0]?.receipt_number || 'N/A',
      'Registered At': format(new Date(reg.created_at), 'PPP p'),
    }));

    // Convert to CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const eventName = selectedEventId !== 'all' 
      ? events.find(e => e.id === selectedEventId)?.title || 'all-events'
      : 'all-events';
    link.download = `registrations-${eventName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Event Registrations</h1>
          <p className="text-muted-foreground">Manage and verify event registrations</p>
        </div>
        <Button onClick={exportToExcel} disabled={filteredRegistrations.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Event Selection Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedEventId === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEventId('all')}
              >
                All Events ({registrations.length})
              </Button>
              {events.map(event => (
                <Button
                  key={event.id}
                  variant={selectedEventId === event.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEventId(event.id)}
                >
                  {event.title} ({registrationsByEvent[event.id]?.length || 0})
                </Button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, enrollment, or event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
          <CardDescription>Click verify to confirm payment and registration</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No registrations found</p>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => (
                <div key={reg.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{reg.user_profiles?.full_name || 'Unknown'}</h4>
                      <Badge variant="outline" className={getStatusColor(reg.payment_status)}>
                        {reg.payment_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reg.user_profiles?.enrollment_number} • {reg.user_profiles?.branch} • {reg.user_profiles?.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mobile: {reg.user_profiles?.mobile} • {reg.user_profiles?.college}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Event: {reg.events?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered: {format(new Date(reg.created_at), 'PPP p')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{reg.events?.entry_fee || 0}</p>
                    {reg.payments?.[0] && (
                      <>
                        <p className="text-xs text-muted-foreground capitalize">
                          via {reg.payments[0].payment_method}
                        </p>
                        {reg.payments[0].transaction_id && (
                          <p className="text-xs text-muted-foreground">
                            Txn: {reg.payments[0].transaction_id}
                          </p>
                        )}
                        {reg.payments[0].receipt_number && (
                          <p className="text-xs text-accent">
                            {reg.payments[0].receipt_number}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {reg.payment_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ 
                          regId: reg.id, 
                          status: 'confirmed',
                          paymentId: reg.payments?.[0]?.id 
                        })}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateMutation.mutate({ 
                          regId: reg.id, 
                          status: 'rejected',
                          paymentId: reg.payments?.[0]?.id 
                        })}
                        disabled={updateMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationsPage;
