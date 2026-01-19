-- Create table for user AI API keys (OpenAI and Gemini)
CREATE TABLE public.user_ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key TEXT,
  gemini_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_ai_api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for user access
CREATE POLICY "Users can view their own AI API keys"
  ON public.user_ai_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI API keys"
  ON public.user_ai_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI API keys"
  ON public.user_ai_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI API keys"
  ON public.user_ai_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_user_ai_api_keys_updated_at
BEFORE UPDATE ON public.user_ai_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();