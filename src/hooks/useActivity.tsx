import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types';
import { useAuth } from './useAuth';

export function useActivity(limit = 20) {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });

  return { activities, isLoading };
}