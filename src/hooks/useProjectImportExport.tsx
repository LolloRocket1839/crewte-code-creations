import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Internal normalized format
interface NormalizedProject {
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

// Legacy format types
interface LegacyExpense {
  id?: string;
  amount: number;
  currency: string;
  date: string;
  recipient: string;
  category: string;
  notes: string | null;
  paid: boolean;
  paid_date?: string | null;
  attachment_name?: string | null;
  created_at?: string;
}

interface LegacyRevenue {
  id?: string;
  amount: number;
  currency: string;
  date: string;
  source: string;
  category: string;
  notes: string | null;
  received: boolean;
  received_date?: string | null;
  is_recurring: boolean;
  recurring_frequency?: string | null;
  recurring_day?: number | null;
  attachment_name?: string | null;
  created_at?: string;
}

interface LegacyProject {
  project: {
    id?: string;
    name: string;
    investment_amount?: number;
    property_value?: number;
    created_at?: string;
  };
  summary?: object;
  metrics?: object;
  expenses: LegacyExpense[];
  revenues: LegacyRevenue[];
  export_date?: string;
  export_version?: string;
}

export type ImportFormat = 'cost-ledger-pro' | 'legacy';

export interface ImportPreview {
  format: ImportFormat;
  projectName: string;
  expensesCount: number;
  revenuesCount: number;
  tasksCount: number;
  expenseCategoriesCount: number;
  revenueCategoriesCount: number;
}

// Detect the format of the imported data
function detectFormat(data: any): ImportFormat | null {
  if (!data || typeof data !== 'object') return null;
  
  // Cost Ledger Pro format has 'app' field and structured categories
  if (data.app === 'Cost Ledger Pro' && Array.isArray(data.expenseCategories)) {
    return 'cost-ledger-pro';
  }
  
  // Legacy format detection:
  // - Has 'project' object with 'name'
  // - Has 'expenses' array OR 'revenues' array
  // - Expenses have 'recipient' field OR revenues have 'source' field
  if (data.project && typeof data.project === 'object' && data.project.name) {
    // Check expenses for legacy format indicators
    if (Array.isArray(data.expenses) && data.expenses.length > 0) {
      const firstExpense = data.expenses[0];
      if ('recipient' in firstExpense || 'paid' in firstExpense) {
        return 'legacy';
      }
    }
    
    // Check revenues for legacy format indicators
    if (Array.isArray(data.revenues) && data.revenues.length > 0) {
      const firstRevenue = data.revenues[0];
      if ('source' in firstRevenue || 'received' in firstRevenue) {
        return 'legacy';
      }
    }
    
    // If has project with investment_amount or property_value, it's legacy
    if ('investment_amount' in data.project || 'property_value' in data.project) {
      return 'legacy';
    }
    
    // If has summary or metrics objects, it's legacy
    if (data.summary || data.metrics) {
      return 'legacy';
    }
  }
  
  // Fallback: check for Cost Ledger Pro format without app field
  if (data.project && Array.isArray(data.expenses) && Array.isArray(data.tasks)) {
    const firstExpense = data.expenses[0];
    if (firstExpense && 'categoryName' in firstExpense) {
      return 'cost-ledger-pro';
    }
  }
  
  return null;
}

// Extract unique categories from legacy format
function extractCategoriesFromLegacy(data: LegacyProject): {
  expenseCategories: Array<{ name: string; color: string }>;
  revenueCategories: Array<{ name: string; color: string }>;
} {
  const expenseCategories = [...new Set(data.expenses.map(e => e.category).filter(Boolean))]
    .map(name => ({ name, color: '#6B7280' }));
  
  const revenueCategories = [...new Set(data.revenues.map(r => r.category).filter(Boolean))]
    .map(name => ({ name, color: '#10B981' }));
  
  return { expenseCategories, revenueCategories };
}

// Normalize legacy format to internal format
function normalizeLegacyData(data: LegacyProject): NormalizedProject {
  const { expenseCategories, revenueCategories } = extractCategoriesFromLegacy(data);
  
  return {
    version: data.export_version || '1.0',
    exportedAt: data.export_date || new Date().toISOString(),
    app: 'Legacy Import',
    project: {
      name: data.project.name,
      description: null,
      budget: data.project.investment_amount || 0,
      status: 'active',
    },
    expenseCategories,
    revenueCategories,
    expenses: data.expenses.map(e => ({
      description: e.recipient,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
      categoryName: e.category || null,
      is_paid: e.paid,
      notes: e.notes,
    })),
    revenues: data.revenues.map(r => ({
      description: r.source,
      amount: r.amount,
      currency: r.currency,
      date: r.date,
      categoryName: r.category || null,
      is_recurring: r.is_recurring,
      recurrence_type: r.recurring_frequency || null,
      recurrence_day: r.recurring_day || null,
      notes: r.notes,
    })),
    tasks: [], // Legacy format doesn't have tasks
  };
}

// Normalize any supported format to internal format
function normalizeImportData(data: any, format: ImportFormat): NormalizedProject {
  if (format === 'legacy') {
    return normalizeLegacyData(data as LegacyProject);
  }
  
  // Cost Ledger Pro format is already normalized
  return {
    version: data.version || '1.0',
    exportedAt: data.exportedAt || new Date().toISOString(),
    app: data.app || 'Cost Ledger Pro',
    project: {
      name: data.project.name,
      description: data.project.description || null,
      budget: data.project.budget || 0,
      status: data.project.status || 'active',
    },
    expenseCategories: data.expenseCategories || [],
    revenueCategories: data.revenueCategories || [],
    expenses: data.expenses || [],
    revenues: data.revenues || [],
    tasks: data.tasks || [],
  };
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
          return { name: name as string, color: '#6B7280' };
        });

      // Get unique revenue categories
      const revenueCategories = [...new Set(revenues?.map(r => r.revenue_categories?.name).filter(Boolean))]
        .map(name => ({ name: name as string, color: '#10B981' }));

      const exportData: NormalizedProject = {
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

  const validateImportData = (data: any): { valid: boolean; format: ImportFormat | null; preview: ImportPreview | null } => {
    const format = detectFormat(data);
    
    if (!format) {
      return { valid: false, format: null, preview: null };
    }
    
    const normalized = normalizeImportData(data, format);
    
    return {
      valid: true,
      format,
      preview: {
        format,
        projectName: normalized.project.name,
        expensesCount: normalized.expenses.length,
        revenuesCount: normalized.revenues.length,
        tasksCount: normalized.tasks.length,
        expenseCategoriesCount: normalized.expenseCategories.length,
        revenueCategoriesCount: normalized.revenueCategories.length,
      },
    };
  };

  const importProject = async (data: any, format: ImportFormat) => {
    if (!user) return null;
    setIsImporting(true);

    try {
      const normalized = normalizeImportData(data, format);
      
      // Create expense categories
      const expenseCategoryMap: Record<string, string> = {};
      for (const cat of normalized.expenseCategories) {
        const { data: existing } = await supabase
          .from('expense_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', cat.name)
          .maybeSingle();

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
      for (const cat of normalized.revenueCategories) {
        const { data: existing } = await supabase
          .from('revenue_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', cat.name)
          .maybeSingle();

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
          name: normalized.project.name,
          description: normalized.project.description,
          budget: normalized.project.budget,
          status: normalized.project.status,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create expenses
      if (normalized.expenses.length > 0) {
        const expensesToInsert = normalized.expenses.map(e => ({
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
      if (normalized.revenues.length > 0) {
        const revenuesToInsert = normalized.revenues.map(r => ({
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
      if (normalized.tasks.length > 0) {
        const tasksToInsert = normalized.tasks.map(t => ({
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
