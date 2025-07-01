
-- Agregar columnas para YouTube y Facebook en la tabla blotato_accounts
ALTER TABLE public.blotato_accounts 
ADD COLUMN youtube_account_id TEXT,
ADD COLUMN facebook_account_id TEXT;
