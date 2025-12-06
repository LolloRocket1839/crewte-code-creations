-- Create enum for project member roles
CREATE TYPE public.project_role AS ENUM ('viewer', 'editor', 'admin');

-- Create project_members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role project_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(project_uuid UUID, min_role project_role DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_uuid AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = project_uuid 
      AND user_id = auth.uid()
      AND (
        role = 'admin' OR
        (min_role = 'editor' AND role IN ('editor', 'admin')) OR
        (min_role = 'viewer')
      )
  )
$$;

-- Create function to check if user is project owner
CREATE OR REPLACE FUNCTION public.is_project_owner(project_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_uuid AND user_id = auth.uid()
  )
$$;

-- RLS policies for project_members
CREATE POLICY "Users can view members of projects they have access to"
ON public.project_members FOR SELECT
USING (public.has_project_access(project_id));

CREATE POLICY "Project owners and admins can add members"
ON public.project_members FOR INSERT
WITH CHECK (
  public.is_project_owner(project_id) OR 
  public.has_project_access(project_id, 'admin')
);

CREATE POLICY "Project owners and admins can update members"
ON public.project_members FOR UPDATE
USING (
  public.is_project_owner(project_id) OR 
  public.has_project_access(project_id, 'admin')
);

CREATE POLICY "Project owners and admins can remove members"
ON public.project_members FOR DELETE
USING (
  public.is_project_owner(project_id) OR 
  public.has_project_access(project_id, 'admin')
);

-- Update projects RLS to include shared access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view owned or shared projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id OR public.has_project_access(id));

-- Update tasks RLS for shared projects
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view tasks in accessible projects"
ON public.tasks FOR SELECT
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id))
);

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
CREATE POLICY "Users can create tasks in accessible projects"
ON public.tasks FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    project_id IS NULL OR 
    public.has_project_access(project_id, 'editor')
  )
);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update tasks in accessible projects"
ON public.tasks FOR UPDATE
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id, 'editor'))
);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete tasks in accessible projects"
ON public.tasks FOR DELETE
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id, 'editor'))
);

-- Update expenses RLS for shared projects
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view expenses in accessible projects"
ON public.expenses FOR SELECT
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id))
);

DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
CREATE POLICY "Users can create expenses in accessible projects"
ON public.expenses FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    project_id IS NULL OR 
    public.has_project_access(project_id, 'editor')
  )
);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update expenses in accessible projects"
ON public.expenses FOR UPDATE
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id, 'editor'))
);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete expenses in accessible projects"
ON public.expenses FOR DELETE
USING (
  auth.uid() = user_id OR 
  (project_id IS NOT NULL AND public.has_project_access(project_id, 'editor'))
);