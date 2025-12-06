import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Revenue, RevenueCategory, Currency } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useRevenues(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: revenues = [], isLoading } = useQuery({
    queryKey: ['revenues', user?.id, projectId],
    queryFn: async () => {
      let query = supabase
        .from('revenues')
        .select('*, category:revenue_categories(*), project:projects(*)')
        .order('date', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Revenue[];
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['revenue_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RevenueCategory[];
    },
    enabled: !!user,
  });

  const createRevenue = useMutation({
    mutationFn: async (revenue: { 
      description: string; 
      amount: number; 
      currency?: Currency;
      category_id?: string | null; 
      project_id?: string | null; 
      date: string;
      is_recurring?: boolean;
      recurrence_type?: 'monthly' | 'quarterly' | 'yearly' | null;
      recurrence_day?: number | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('revenues')
        .insert({ 
          ...revenue, 
          user_id: user!.id,
          currency: revenue.currency || 'EUR',
        })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'created',
        entity_type: 'revenue',
        entity_id: data.id,
        entity_name: data.description,
        metadata: { amount: data.amount, currency: data.currency },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Entrata aggiunta con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'aggiunta dell\'entrata', description: error.message, variant: 'destructive' });
    },
  });

  const updateRevenue = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Revenue> & { id: string }) => {
      const { data, error } = await supabase
        .from('revenues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Entrata aggiornata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'aggiornamento dell\'entrata', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRevenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('revenues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Entrata eliminata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'eliminazione dell\'entrata', description: error.message, variant: 'destructive' });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('revenue_categories')
        .insert({ ...category, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_categories'] });
      toast({ title: 'Categoria entrate creata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nella creazione della categoria', description: error.message, variant: 'destructive' });
    },
  });

  const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
  
  const revenuesByCurrency = revenues.reduce((acc, r) => {
    const currency = r.currency || 'EUR';
    acc[currency] = (acc[currency] || 0) + Number(r.amount);
    return acc;
  }, {} as Record<string, number>);

  return { 
    revenues, 
    categories, 
    isLoading, 
    createRevenue, 
    updateRevenue, 
    deleteRevenue,
    createCategory,
    totalRevenues,
    revenuesByCurrency,
  };
}
