import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense, ExpenseCategory } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useExpenses(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id, projectId],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*, category:expense_categories(*), project:projects(*)')
        .order('date', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as ExpenseCategory[];
    },
    enabled: !!user,
  });

  const createExpense = useMutation({
    mutationFn: async (expense: { description: string; amount: number; category_id?: string | null; project_id?: string | null; date: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...expense, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'created',
        entity_type: 'expense',
        entity_id: data.id,
        entity_name: data.description,
        metadata: { amount: data.amount },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Expense added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add expense', description: error.message, variant: 'destructive' });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Expense updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update expense', description: error.message, variant: 'destructive' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Expense deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete expense', description: error.message, variant: 'destructive' });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({ ...category, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create category', description: error.message, variant: 'destructive' });
    },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return { 
    expenses, 
    categories, 
    isLoading, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    createCategory,
    totalExpenses,
  };
}