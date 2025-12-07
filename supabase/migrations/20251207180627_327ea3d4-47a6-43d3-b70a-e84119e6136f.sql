-- Fix: Require authentication for profiles table access
-- Drop existing SELECT policy and recreate with authentication requirement
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Fix: Require authentication for expenses table access
-- Drop existing SELECT policy and recreate with authentication requirement
DROP POLICY IF EXISTS "Users can view expenses in accessible projects" ON public.expenses;

CREATE POLICY "Users can view expenses in accessible projects"
ON public.expenses
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR ((project_id IS NOT NULL) AND has_project_access(project_id)));

-- Also fix revenues table for consistency
DROP POLICY IF EXISTS "Users can view revenues in accessible projects" ON public.revenues;

CREATE POLICY "Users can view revenues in accessible projects"
ON public.revenues
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR ((project_id IS NOT NULL) AND has_project_access(project_id)));

-- Fix tasks table
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON public.tasks;

CREATE POLICY "Users can view tasks in accessible projects"
ON public.tasks
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR ((project_id IS NOT NULL) AND has_project_access(project_id)));

-- Fix projects table
DROP POLICY IF EXISTS "Users can view owned or shared projects" ON public.projects;

CREATE POLICY "Users can view owned or shared projects"
ON public.projects
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_project_access(id));

-- Fix activity_log table
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_log;

CREATE POLICY "Users can view their own activity"
ON public.activity_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix expense_categories table
DROP POLICY IF EXISTS "Users can view their own categories" ON public.expense_categories;

CREATE POLICY "Users can view their own categories"
ON public.expense_categories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix revenue_categories table
DROP POLICY IF EXISTS "Users can view their own revenue categories" ON public.revenue_categories;

CREATE POLICY "Users can view their own revenue categories"
ON public.revenue_categories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix project_members table
DROP POLICY IF EXISTS "Users can view members of projects they have access to" ON public.project_members;

CREATE POLICY "Users can view members of projects they have access to"
ON public.project_members
FOR SELECT
TO authenticated
USING (has_project_access(project_id));