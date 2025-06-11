
-- Agregar columna para almacenar imágenes en los mensajes
ALTER TABLE public.messages 
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Crear índice para optimizar consultas de mensajes con imágenes
CREATE INDEX idx_messages_images ON public.messages USING GIN (images);
