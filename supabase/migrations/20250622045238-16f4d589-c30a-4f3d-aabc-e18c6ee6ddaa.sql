
-- Agregar columna title a la tabla generated_videos
ALTER TABLE public.generated_videos 
ADD COLUMN title TEXT;

-- Crear índice para optimizar búsquedas por título
CREATE INDEX idx_generated_videos_title ON public.generated_videos(title);

-- Función para generar título automáticamente basado en el script
CREATE OR REPLACE FUNCTION public.generate_video_title(script_content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    title_result TEXT;
    words_array TEXT[];
    first_words TEXT;
BEGIN
    -- Limpiar el script de caracteres especiales y espacios extra
    script_content := TRIM(regexp_replace(script_content, '\s+', ' ', 'g'));
    
    -- Si el script está vacío, retornar título por defecto
    IF script_content IS NULL OR LENGTH(script_content) < 10 THEN
        RETURN 'Video Generado - ' || TO_CHAR(NOW(), 'DD/MM/YYYY');
    END IF;
    
    -- Tomar las primeras 8-10 palabras del script
    words_array := string_to_array(script_content, ' ');
    
    -- Construir título con las primeras palabras
    IF array_length(words_array, 1) <= 8 THEN
        first_words := array_to_string(words_array, ' ');
    ELSE
        first_words := array_to_string(words_array[1:8], ' ');
    END IF;
    
    -- Capitalizar primera letra y limitar longitud
    title_result := INITCAP(first_words);
    
    -- Agregar puntos suspensivos si es muy largo
    IF LENGTH(title_result) > 60 THEN
        title_result := LEFT(title_result, 57) || '...';
    END IF;
    
    RETURN title_result;
END;
$$;

-- Trigger function para generar título automáticamente
CREATE OR REPLACE FUNCTION public.auto_generate_video_title()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Solo generar título si no existe uno
    IF NEW.title IS NULL OR NEW.title = '' THEN
        NEW.title := public.generate_video_title(NEW.script);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Crear trigger para ejecutar antes de insertar o actualizar
DROP TRIGGER IF EXISTS trigger_generate_video_title ON public.generated_videos;
CREATE TRIGGER trigger_generate_video_title
    BEFORE INSERT OR UPDATE ON public.generated_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_video_title();

-- Generar títulos para videos existentes que no tienen título
UPDATE public.generated_videos 
SET title = public.generate_video_title(script)
WHERE title IS NULL OR title = '';
