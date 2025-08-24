-- Add remaining missing columns to user_video_configs table
ALTER TABLE public.user_video_configs
ADD COLUMN IF NOT EXISTS second_avatar_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS generated_script text,
ADD COLUMN IF NOT EXISTS card_customization jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS presenter_customization jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_key_id uuid REFERENCES public.heygen_api_keys(id);

-- Create index for the foreign key relationship
CREATE INDEX IF NOT EXISTS idx_user_video_configs_api_key_id ON public.user_video_configs(api_key_id);