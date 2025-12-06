import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Expense, ExpenseCategory, ExpenseFilters, Currency } from '@/types';
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
    mutationFn: async (expense: { 
      description: string; 
      amount: number; 
      currency?: Currency;
      category_id?: string | null; 
      project_id?: string | null; 
      date: string;
      is_paid?: boolean;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ 
          ...expense, 
          user_id: user!.id,
          currency: expense.currency || 'EUR',
          paid_at: expense.is_paid ? new Date().toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'created',
        entity_type: 'expense',
        entity_id: data.id,
        entity_name: data.description,
        metadata: { amount: data.amount, currency: data.currency },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Spesa aggiunta con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'aggiunta della spesa', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Spesa aggiornata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'aggiornamento della spesa', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Spesa eliminata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'eliminazione della spesa', description: error.message, variant: 'destructive' });
    },
  });

  const togglePaidStatus = useMutation({
    mutationFn: async ({ id, is_paid }: { id: string; is_paid: boolean }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ 
          is_paid, 
          paid_at: is_paid ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: data.is_paid ? 'Spesa segnata come pagata' : 'Spesa segnata come non pagata' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nell\'aggiornamento dello stato', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Categoria creata con successo' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore nella creazione della categoria', description: error.message, variant: 'destructive' });
    },
  });

  // Filter expenses
  const filterExpenses = (filters: ExpenseFilters) => {
    return expenses.filter((expense) => {
      // Search
      if (filters.search && !expense.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category
      if (filters.categoryId && expense.category_id !== filters.categoryId) {
        return false;
      }
      // Project
      if (filters.projectId && expense.project_id !== filters.projectId) {
        return false;
      }
      // Paid status
      if (filters.isPaid !== null && expense.is_paid !== filters.isPaid) {
        return false;
      }
      // Currency
      if (filters.currency && expense.currency !== filters.currency) {
        return false;
      }
      // Date range
      if (filters.dateFrom && expense.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && expense.date > filters.dateTo) {
        return false;
      }
      return true;
    });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const expensesByCurrency = expenses.reduce((acc, e) => {
    const currency = e.currency || 'EUR';
    acc[currency] = (acc[currency] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const paidExpenses = expenses.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);
  const unpaidExpenses = expenses.filter(e => !e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);

  return { 
    expenses, 
    categories, 
    isLoading, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    togglePaidStatus,
    createCategory,
    filterExpenses,
    totalExpenses,
    expensesByCurrency,
    paidExpenses,
    unpaidExpenses,
  };
}
