
-- Paso 1: Eliminar filas duplicadas, dejando solo la más reciente por user_id
DELETE FROM public.blotato_accounts
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.blotato_accounts
  ORDER BY user_id, updated_at DESC
);

-- Paso 2: Agregar constraint UNIQUE en user_id para prevenir futuros duplicados
ALTER TABLE public.blotato_accounts 
ADD CONSTRAINT blotato_accounts_user_id_unique UNIQUE (user_id);

-- Paso 3: Comentario explicativo
COMMENT ON CONSTRAINT blotato_accounts_user_id_unique ON public.blotato_accounts 
IS 'Ensures each user can only have one Blotato account configuration';
