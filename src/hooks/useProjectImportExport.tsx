import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ExportedProject {
  version: string;
  exportedAt: string;
  app: string;
  project: {
    name: string;
    description: string | null;
    budget: number;
    status: string;
  };
  expenseCategories: Array<{ name: string; color: string }>;
  revenueCategories: Array<{ name: string; color: string }>;
  expenses: Array<{
    description: string;
    amount: number;
    currency: string;
    date: string;
    categoryName: string | null;
    is_paid: boolean;
    notes: string | null;
  }>;
  revenues: Array<{
    description: string;
    amount: number;
    currency: string;
    date: string;
    categoryName: string | null;
    is_recurring: boolean;
    recurrence_type: string | null;
    recurrence_day: number | null;
    notes: string | null;
  }>;
  tasks: Array<{
    title: string;
    description: string | null;
    priority: string;
    status: string;
    due_date: string | null;
  }>;
}

export function useProjectImportExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportProject = async (projectId: string) => {
    if (!user) return;
    setIsExporting(true);

    try {
      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch expenses with categories
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*, expense_categories(name)')
        .eq('project_id', projectId);

      if (expensesError) throw expensesError;

      // Fetch revenues with categories
      const { data: revenues, error: revenuesError } = await supabase
        .from('revenues')
        .select('*, revenue_categories(name)')
        .eq('project_id', projectId);

      if (revenuesError) throw revenuesError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Get unique expense categories
      const expenseCategories = [...new Set(expenses?.map(e => e.expense_categories?.name).filter(Boolean))]
        .map(name => {
          const expense = expenses?.find(e => e.expense_categories?.name === name);
          return { name: name as string, color: '#6B7280' };
        });

      // Get unique revenue categories
      const revenueCategories = [...new Set(revenues?.map(r => r.revenue_categories?.name).filter(Boolean))]
        .map(name => ({ name: name as string, color: '#10B981' }));

      const exportData: ExportedProject = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        app: 'Cost Ledger Pro',
        project: {
          name: project.name,
          description: project.description,
          budget: project.budget || 0,
          status: project.status || 'active',
        },
        expenseCategories,
        revenueCategories,
        expenses: expenses?.map(e => ({
          description: e.description,
          amount: e.amount,
          currency: e.currency,
          date: e.date,
          categoryName: e.expense_categories?.name || null,
          is_paid: e.is_paid,
          notes: e.notes,
        })) || [],
        revenues: revenues?.map(r => ({
          description: r.description,
          amount: r.amount,
          currency: r.currency,
          date: r.date,
          categoryName: r.revenue_categories?.name || null,
          is_recurring: r.is_recurring,
          recurrence_type: r.recurrence_type,
          recurrence_day: r.recurrence_day,
          notes: r.notes,
        })) || [],
        tasks: tasks?.map(t => ({
          title: t.title,
          description: t.description,
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          due_date: t.due_date,
        })) || [],
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const sanitizedName = project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `project-${sanitizedName}-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Project exported successfully' });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const validateImportData = (data: any): data is ExportedProject => {
    if (!data || typeof data !== 'object') return false;
    if (!data.project || typeof data.project.name !== 'string') return false;
    if (!Array.isArray(data.expenses)) return false;
    if (!Array.isArray(data.revenues)) return false;
    if (!Array.isArray(data.tasks)) return false;
    return true;
  };

  const importProject = async (data: ExportedProject) => {
    if (!user) return null;
    setIsImporting(true);

    try {
      // Create expense categories
      const expenseCategoryMap: Record<string, string> = {};
      for (const cat of data.expenseCategories || []) {
        const { data: existing } = await supabase
          .from('expense_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', cat.name)
          .single();

        if (existing) {
          expenseCategoryMap[cat.name] = existing.id;
        } else {
          const { data: newCat, error } = await supabase
            .from('expense_categories')
            .insert({ name: cat.name, color: cat.color, user_id: user.id })
            .select()
            .single();
          if (!error && newCat) {
            expenseCategoryMap[cat.name] = newCat.id;
          }
        }
      }

      // Create revenue categories
      const revenueCategoryMap: Record<string, string> = {};
      for (const cat of data.revenueCategories || []) {
        const { data: existing } = await supabase
          .from('revenue_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', cat.name)
          .single();

        if (existing) {
          revenueCategoryMap[cat.name] = existing.id;
        } else {
          const { data: newCat, error } = await supabase
            .from('revenue_categories')
            .insert({ name: cat.name, color: cat.color, user_id: user.id })
            .select()
            .single();
          if (!error && newCat) {
            revenueCategoryMap[cat.name] = newCat.id;
          }
        }
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: data.project.name,
          description: data.project.description,
          budget: data.project.budget,
          status: data.project.status,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create expenses
      if (data.expenses.length > 0) {
        const expensesToInsert = data.expenses.map(e => ({
          description: e.description,
          amount: e.amount,
          currency: e.currency || 'EUR',
          date: e.date,
          category_id: e.categoryName ? expenseCategoryMap[e.categoryName] : null,
          is_paid: e.is_paid ?? false,
          notes: e.notes,
          project_id: project.id,
          user_id: user.id,
        }));
        await supabase.from('expenses').insert(expensesToInsert);
      }

      // Create revenues
      if (data.revenues.length > 0) {
        const revenuesToInsert = data.revenues.map(r => ({
          description: r.description,
          amount: r.amount,
          currency: r.currency || 'EUR',
          date: r.date,
          category_id: r.categoryName ? revenueCategoryMap[r.categoryName] : null,
          is_recurring: r.is_recurring ?? false,
          recurrence_type: r.recurrence_type,
          recurrence_day: r.recurrence_day,
          notes: r.notes,
          project_id: project.id,
          user_id: user.id,
        }));
        await supabase.from('revenues').insert(revenuesToInsert);
      }

      // Create tasks
      if (data.tasks.length > 0) {
        const tasksToInsert = data.tasks.map(t => ({
          title: t.title,
          description: t.description,
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          due_date: t.due_date,
          project_id: project.id,
          user_id: user.id,
        }));
        await supabase.from('tasks').insert(tasksToInsert);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
      queryClient.invalidateQueries({ queryKey: ['revenue_categories'] });

      toast({ title: 'Project imported successfully' });
      return project.id;
    } catch (error: any) {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportProject,
    importProject,
    validateImportData,
    isExporting,
    isImporting,
  };
}
