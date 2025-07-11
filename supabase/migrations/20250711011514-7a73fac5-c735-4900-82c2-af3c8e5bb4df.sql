-- Create enum for video generation status
CREATE TYPE public.video_generation_status AS ENUM ('processing', 'completed', 'expired');

-- Create video generation tracking table
CREATE TABLE public.video_generation_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_id TEXT NOT NULL,
  script TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_check_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status video_generation_status NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_generation_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own video generation tracking" 
ON public.video_generation_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video generation tracking" 
ON public.video_generation_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video generation tracking" 
ON public.video_generation_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video generation tracking" 
ON public.video_generation_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_generation_tracking_updated_at
BEFORE UPDATE ON public.video_generation_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_video_generation_tracking_user_status ON public.video_generation_tracking(user_id, status);
CREATE INDEX idx_video_generation_tracking_request_id ON public.video_generation_tracking(request_id);