import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getCurrencyFromTimezone } from '@/lib/currencyUtils';
import { Currency } from '@/types';

export function useUserCurrency() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's saved currency preference from profile
  const { data: profile } = useQuery({
    queryKey: ['profile-currency', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('default_currency')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get the effective default currency
  // Priority: 1) User saved preference, 2) Timezone detection
  const defaultCurrency: Currency = (profile?.default_currency as Currency) || getCurrencyFromTimezone();

  // Mutation to update user's currency preference
  const updateDefaultCurrency = useMutation({
    mutationFn: async (currency: Currency) => {
      const { error } = await supabase
        .from('profiles')
        .update({ default_currency: currency })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-currency'] });
    },
  });

  return {
    defaultCurrency,
    updateDefaultCurrency,
    isLoading: !profile && !!user,
  };
}
