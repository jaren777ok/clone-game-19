
-- Add request_id column to generated_videos table
ALTER TABLE public.generated_videos 
ADD COLUMN request_id TEXT;

-- Create index for better performance when querying by request_id
CREATE INDEX idx_generated_videos_request_id ON public.generated_videos(request_id);

-- Create index for better performance when querying by user_id and created_at
CREATE INDEX idx_generated_videos_user_created ON public.generated_videos(user_id, created_at DESC);
