-- Create missing tables for the video generation and chat app

-- 1. Create chats table for neurocopy chat functionality
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policies for chats
CREATE POLICY "Users can view their own chats" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
ON public.chats 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Create messages table for chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  images TEXT[], -- Array of image URLs/base64
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages from their chats" 
ON public.messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their chats" 
ON public.messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = messages.chat_id 
  AND chats.user_id = auth.uid()
));

-- 3. Create heygen_api_keys table for HeyGen API management
CREATE TABLE IF NOT EXISTS public.heygen_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on heygen_api_keys
ALTER TABLE public.heygen_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for heygen_api_keys
CREATE POLICY "Users can view their own API keys" 
ON public.heygen_api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
ON public.heygen_api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
ON public.heygen_api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
ON public.heygen_api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create blotato_accounts table for social media accounts
CREATE TABLE IF NOT EXISTS public.blotato_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_encrypted TEXT NOT NULL,
  instagram_account_id TEXT,
  tiktok_account_id TEXT,
  youtube_account_id TEXT,
  facebook_account_id TEXT,
  facebook_page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blotato_accounts
ALTER TABLE public.blotato_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for blotato_accounts
CREATE POLICY "Users can view their own blotato accounts" 
ON public.blotato_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blotato accounts" 
ON public.blotato_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blotato accounts" 
ON public.blotato_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blotato accounts" 
ON public.blotato_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create user_video_configs table for video configurations
CREATE TABLE IF NOT EXISTS public.user_video_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_video_configs
ALTER TABLE public.user_video_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_video_configs
CREATE POLICY "Users can view their own video configs" 
ON public.user_video_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video configs" 
ON public.user_video_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video configs" 
ON public.user_video_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video configs" 
ON public.user_video_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Create generated_videos table for completed videos
CREATE TABLE IF NOT EXISTS public.generated_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  config_data JSONB DEFAULT '{}',
  heygen_video_id TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on generated_videos
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for generated_videos
CREATE POLICY "Users can view their own videos" 
ON public.generated_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
ON public.generated_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
ON public.generated_videos 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create video_generation_tracking table for generation progress
CREATE TABLE IF NOT EXISTS public.video_generation_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.generated_videos(id) ON DELETE CASCADE,
  heygen_video_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  webhook_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on video_generation_tracking
ALTER TABLE public.video_generation_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for video_generation_tracking
CREATE POLICY "Users can view their own tracking" 
ON public.video_generation_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking" 
ON public.video_generation_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking" 
ON public.video_generation_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_heygen_api_keys_updated_at
  BEFORE UPDATE ON public.heygen_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blotato_accounts_updated_at
  BEFORE UPDATE ON public.blotato_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_video_configs_updated_at
  BEFORE UPDATE ON public.user_video_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON public.generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_generation_tracking_updated_at
  BEFORE UPDATE ON public.video_generation_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();