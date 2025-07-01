
-- Create table for Blotato API keys
CREATE TABLE public.blotato_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blotato_api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own Blotato API keys" 
  ON public.blotato_api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Blotato API keys" 
  ON public.blotato_api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Blotato API keys" 
  ON public.blotato_api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Blotato API keys" 
  ON public.blotato_api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_blotato_api_keys_updated_at
    BEFORE UPDATE ON public.blotato_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
