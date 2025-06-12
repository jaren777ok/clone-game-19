
-- Crear tabla para almacenar videos generados por usuarios
CREATE TABLE public.generated_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  script TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean sus propios videos
CREATE POLICY "Users can view their own videos" 
  ON public.generated_videos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuarios puedan crear sus propios videos
CREATE POLICY "Users can create their own videos" 
  ON public.generated_videos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para que usuarios puedan eliminar sus propios videos
CREATE POLICY "Users can delete their own videos" 
  ON public.generated_videos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON public.generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
