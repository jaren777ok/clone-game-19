-- Add manual_customization column to user_video_configs table
ALTER TABLE public.user_video_configs 
ADD COLUMN manual_customization JSONB DEFAULT NULL;