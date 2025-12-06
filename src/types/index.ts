export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  budget: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string;
  created_at: string;
  profile?: Profile;
}

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface RevenueCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export type Currency = 'EUR' | 'CHF' | 'USD' | 'GBP';

export interface Expense {
  id: string;
  user_id: string;
  project_id: string | null;
  category_id: string | null;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  is_paid: boolean;
  paid_at: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  project?: Project;
}

export interface Revenue {
  id: string;
  user_id: string;
  project_id: string | null;
  category_id: string | null;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  is_recurring: boolean;
  recurrence_type: 'monthly' | 'quarterly' | 'yearly' | null;
  recurrence_day: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: RevenueCategory;
  project?: Project;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_id: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
  project?: Project;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ExpenseFilters {
  search: string;
  categoryId: string | null;
  projectId: string | null;
  isPaid: boolean | null;
  currency: Currency | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface InvestmentMetrics {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  roi: number;
  capRate: number;
  cashOnCash: number;
}

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'CHF', label: 'Franco Svizzero', symbol: 'CHF' },
  { value: 'USD', label: 'Dollaro USA', symbol: '$' },
  { value: 'GBP', label: 'Sterlina', symbol: '£' },
];

export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCIES.find(c => c.value === currency)?.symbol || currency;
};
