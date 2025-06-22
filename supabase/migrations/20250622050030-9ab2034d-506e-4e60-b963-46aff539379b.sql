
-- Desactivar el trigger automático de generación de títulos
-- ya que la IA backend se encarga de esto
DROP TRIGGER IF EXISTS trigger_generate_video_title ON public.generated_videos;

-- Eliminar las funciones que ya no necesitamos
DROP FUNCTION IF EXISTS public.auto_generate_video_title();
DROP FUNCTION IF EXISTS public.generate_video_title(text);

-- El campo title se mantiene en la tabla pero ahora será llenado
-- exclusivamente por la IA backend via webhook
