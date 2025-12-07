-- Add default_currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_currency text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.default_currency IS 'User preferred default currency (EUR, CHF, USD, GBP). NULL means auto-detect from timezone.';