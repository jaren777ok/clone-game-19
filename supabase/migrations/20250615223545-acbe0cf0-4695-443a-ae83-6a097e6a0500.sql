
-- Crear tabla para almacenar las claves API de HeyGen de los usuarios
CREATE TABLE public.heygen_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.heygen_api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que los usuarios solo vean sus propias claves API
CREATE POLICY "Users can view their own API keys" 
  ON public.heygen_api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
  ON public.heygen_api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.heygen_api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.heygen_api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para optimizar las consultas
CREATE INDEX idx_heygen_api_keys_user_id ON public.heygen_api_keys(user_id);
CREATE INDEX idx_heygen_api_keys_created_at ON public.heygen_api_keys(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_heygen_api_keys_updated_at 
    BEFORE UPDATE ON public.heygen_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
