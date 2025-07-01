
-- Crear tabla para almacenar cuentas de Blotato
CREATE TABLE public.blotato_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  instagram_account_id TEXT,
  tiktok_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.blotato_accounts ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own Blotato accounts" 
  ON public.blotato_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Blotato accounts" 
  ON public.blotato_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Blotato accounts" 
  ON public.blotato_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Blotato accounts" 
  ON public.blotato_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_blotato_accounts_updated_at 
  BEFORE UPDATE ON public.blotato_accounts 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
