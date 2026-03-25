import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EventRegistration, Payment, Certificate, EventWinner, Event } from '@/types/database';

export const useUserRegistrations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-registrations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(reg => ({
        ...reg,
        event: reg.events as Event
      })) as EventRegistration[];
    },
    enabled: !!userId,
  });
};

export const useUserPayments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-payments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event_registrations (
            *,
            events (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(payment => ({
        ...payment,
        event_registration: payment.event_registrations ? {
          ...payment.event_registrations,
          event: (payment.event_registrations as any).events as Event
        } : null
      })) as Payment[];
    },
    enabled: !!userId,
  });
};

export const useUserCertificates = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-certificates', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data.map(cert => ({
        ...cert,
        event: cert.events as Event
      })) as Certificate[];
    },
    enabled: !!userId,
  });
};

export const useUserWinnings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-winnings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('event_winners')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(winner => ({
        ...winner,
        event: winner.events as Event
      })) as EventWinner[];
    },
    enabled: !!userId,
  });
};

export const useEventDetails = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });
};

export const useCheckRegistration = (userId: string | undefined, eventId: string | undefined) => {
  return useQuery({
    queryKey: ['check-registration', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();
      if (error) throw error;
      return data as EventRegistration | null;
    },
    enabled: !!userId && !!eventId,
  });
};
