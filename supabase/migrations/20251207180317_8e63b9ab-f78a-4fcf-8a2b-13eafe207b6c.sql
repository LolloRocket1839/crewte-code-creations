-- Add restrictive policies to prevent UPDATE and DELETE on activity_log
-- Activity logs should be immutable for audit trail integrity

-- Policy to deny all UPDATE operations
CREATE POLICY "Activity log entries cannot be updated"
ON public.activity_log
FOR UPDATE
USING (false);

-- Policy to deny all DELETE operations  
CREATE POLICY "Activity log entries cannot be deleted"
ON public.activity_log
FOR DELETE
USING (false);