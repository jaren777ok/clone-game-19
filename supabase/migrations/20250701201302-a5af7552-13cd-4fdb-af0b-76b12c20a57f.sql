
-- Agregar columna para ID de página de Facebook en la tabla blotato_accounts
ALTER TABLE public.blotato_accounts 
ADD COLUMN facebook_page_id TEXT;
