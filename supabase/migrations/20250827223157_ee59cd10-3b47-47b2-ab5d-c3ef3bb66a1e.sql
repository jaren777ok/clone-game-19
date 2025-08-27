-- Add script column to generated_videos table for AI caption generation
ALTER TABLE public.generated_videos 
ADD COLUMN script TEXT;

-- Add index for better performance when searching by script
CREATE INDEX IF NOT EXISTS idx_generated_videos_script ON public.generated_videos(script);

-- Update any existing videos that might have script data in config_data
-- This is a best-effort migration to extract script from config_data if it exists
UPDATE public.generated_videos 
SET script = COALESCE(
  config_data->>'script',
  config_data->>'generatedScript', 
  title
)
WHERE script IS NULL;