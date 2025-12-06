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

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  project_id: string | null;
  category_id: string | null;
  description: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
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