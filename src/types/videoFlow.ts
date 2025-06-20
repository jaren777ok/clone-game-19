
export interface HeyGenApiKey {
  id: string;
  api_key_name: string;
  api_key_encrypted: string;
  created_at: string;
}

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
}

export interface VideoStyle {
  id: string;
  name: string;
  video_url: string;
}

export interface FlowState {
  step: 'loading' | 'api-key' | 'avatar' | 'style' | 'generator';
  selectedApiKey: HeyGenApiKey | null;
  selectedAvatar: Avatar | null;
  selectedStyle: VideoStyle | null;
}
