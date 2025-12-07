import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Currency } from '@/types';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  default_currency: Currency | null;
  created_at: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { full_name?: string; default_currency?: Currency }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-currency'] });
      toast.success('Profilo aggiornato');
    },
    onError: () => {
      toast.error('Errore durante l\'aggiornamento');
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
  };
}
