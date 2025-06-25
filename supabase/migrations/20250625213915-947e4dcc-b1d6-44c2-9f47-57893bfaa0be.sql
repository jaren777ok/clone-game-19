
-- Crear tabla para almacenar la configuración temporal del flujo de video por usuario
CREATE TABLE public.user_video_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES public.heygen_api_keys(id) ON DELETE SET NULL,
  avatar_data jsonb,
  voice_data jsonb,
  style_data jsonb,
  presenter_customization jsonb,
  card_customization jsonb,
  generated_script text,
  current_step text NOT NULL DEFAULT 'api-key',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Solo una configuración por usuario
);

-- Habilitar Row Level Security
ALTER TABLE public.user_video_configs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean su propia configuración
CREATE POLICY "Users can view their own video config" 
  ON public.user_video_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su configuración
CREATE POLICY "Users can create their own video config" 
  ON public.user_video_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su configuración
CREATE POLICY "Users can update their own video config" 
  ON public.user_video_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar su configuración
CREATE POLICY "Users can delete their own video config" 
  ON public.user_video_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_video_configs_updated_at
  BEFORE UPDATE ON public.user_video_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
