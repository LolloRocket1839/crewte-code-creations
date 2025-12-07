-- Drop existing SELECT policy and create a more explicit one
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create explicit policy that requires authentication and only allows viewing own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add explicit deny for anon role (optional but makes intent clear)
-- Note: RLS already denies by default, but this documents the intent