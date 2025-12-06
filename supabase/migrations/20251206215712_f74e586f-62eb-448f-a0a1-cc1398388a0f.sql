-- Add new columns to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS receipt_url text;

-- Create revenues table for income tracking
CREATE TABLE public.revenues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_type text, -- 'monthly', 'quarterly', 'yearly'
  recurrence_day integer, -- day of month for recurrence
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on revenues
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

-- RLS policies for revenues (same pattern as expenses)
CREATE POLICY "Users can view revenues in accessible projects"
ON public.revenues FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  ((project_id IS NOT NULL) AND has_project_access(project_id))
);

CREATE POLICY "Users can create revenues in accessible projects"
ON public.revenues FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND 
  ((project_id IS NULL) OR has_project_access(project_id, 'editor'::project_role))
);

CREATE POLICY "Users can update revenues in accessible projects"
ON public.revenues FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  ((project_id IS NOT NULL) AND has_project_access(project_id, 'editor'::project_role))
);

CREATE POLICY "Users can delete revenues in accessible projects"
ON public.revenues FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  ((project_id IS NOT NULL) AND has_project_access(project_id, 'editor'::project_role))
);

-- Create revenue_categories table (separate from expense categories)
CREATE TABLE public.revenue_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#10B981',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.revenue_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue categories"
ON public.revenue_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue categories"
ON public.revenue_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue categories"
ON public.revenue_categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue categories"
ON public.revenue_categories FOR DELETE
USING (auth.uid() = user_id);

-- Update revenues to use revenue_categories
ALTER TABLE public.revenues 
DROP CONSTRAINT IF EXISTS revenues_category_id_fkey,
ADD CONSTRAINT revenues_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.revenue_categories(id) ON DELETE SET NULL;

-- Add trigger for updated_at on revenues
CREATE TRIGGER update_revenues_updated_at
BEFORE UPDATE ON public.revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();