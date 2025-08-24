-- Add missing columns to video_generation_tracking table
ALTER TABLE public.video_generation_tracking 
ADD COLUMN IF NOT EXISTS request_id text,
ADD COLUMN IF NOT EXISTS script text;

-- Add missing columns to generated_videos table  
ALTER TABLE public.generated_videos
ADD COLUMN IF NOT EXISTS request_id text;

-- Add missing columns to user_video_configs table
ALTER TABLE public.user_video_configs
ADD COLUMN IF NOT EXISTS manual_customization jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS subtitle_customization jsonb DEFAULT '{}', 
ADD COLUMN IF NOT EXISTS current_step text DEFAULT 'api-key',
ADD COLUMN IF NOT EXISTS avatar_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS voice_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS style_data jsonb DEFAULT '{}';

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_video_generation_tracking_request_id ON public.video_generation_tracking(request_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_request_id ON public.generated_videos(request_id);
CREATE INDEX IF NOT EXISTS idx_user_video_configs_current_step ON public.user_video_configs(current_step);