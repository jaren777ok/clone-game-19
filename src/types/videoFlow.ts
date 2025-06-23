
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

export interface Voice {
  voice_id: string;
  voice_name: string;
  preview_audio_url: string;
}

export interface VideoStyle {
  id: string;
  name: string;
  video_url: string;
}

export interface CardCustomization {
  fecha: string;
  titulo: string;
  subtitulo: string;
}

export interface FlowState {
  step: 'loading' | 'api-key' | 'avatar' | 'voice' | 'style' | 'neurocopy' | 'generator';
  selectedApiKey: HeyGenApiKey | null;
  selectedAvatar: Avatar | null;
  selectedVoice: Voice | null;
  selectedStyle: VideoStyle | null;
  generatedScript: string | null;
  cardCustomization?: CardCustomization | null;
}
