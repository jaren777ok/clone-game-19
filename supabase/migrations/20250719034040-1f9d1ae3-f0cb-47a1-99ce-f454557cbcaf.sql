
-- Add second_avatar_data column to user_video_configs table
ALTER TABLE public.user_video_configs 
ADD COLUMN second_avatar_data jsonb DEFAULT NULL;
