-- Create project_invitations table for pending invites
CREATE TABLE public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role project_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, email)
);

-- Enable RLS
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Project owners and admins can create invitations
CREATE POLICY "Project owners and admins can create invitations"
ON public.project_invitations
FOR INSERT
WITH CHECK (is_project_owner(project_id) OR has_project_access(project_id, 'admin'::project_role));

-- Policy: Project owners and admins can view invitations
CREATE POLICY "Project owners and admins can view invitations"
ON public.project_invitations
FOR SELECT
USING (is_project_owner(project_id) OR has_project_access(project_id, 'admin'::project_role));

-- Policy: Project owners and admins can delete invitations
CREATE POLICY "Project owners and admins can delete invitations"
ON public.project_invitations
FOR DELETE
USING (is_project_owner(project_id) OR has_project_access(project_id, 'admin'::project_role));

-- Create function to handle pending invitations when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_pending_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert project members from pending invitations
  INSERT INTO public.project_members (project_id, user_id, role, invited_by)
  SELECT project_id, NEW.id, role, invited_by
  FROM public.project_invitations
  WHERE LOWER(email) = LOWER(NEW.email);
  
  -- Delete processed invitations
  DELETE FROM public.project_invitations WHERE LOWER(email) = LOWER(NEW.email);
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_created_handle_invitations
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_pending_invitations();