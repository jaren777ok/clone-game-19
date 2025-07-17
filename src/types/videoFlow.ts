
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

export interface PresenterCustomization {
  nombrePresentador: string;
}

export interface ApiVersionCustomization {
  isPaidVersion: boolean;
  width: number;
  height: number;
}

export interface Base64File {
  name: string;
  data: string; // base64 encoded content
  type: string;
  size: number;
}

export interface ManualCustomization {
  images: Base64File[];
  videos: Base64File[];
  sessionId?: string; // For reference
}

export interface SubtitleCustomization {
  fontFamily: string;
  subtitleEffect: 'color' | 'fade' | 'bounce' | 'slide' | 'highlight' | 'karaoke';
  placementEffect: 'animate' | 'align' | 'static';
  textTransform: 'uppercase' | 'capitalize' | 'lowercase';
  hasBackgroundColor: boolean;
  backgroundColor: string;
  textColor: string;
  Tamañofuente: number;
  "Fixed size": number;
  fill?: string;
}

export interface FlowState {
  step: 'loading' | 'api-key' | 'avatar' | 'voice' | 'style' | 'subtitle-customization' | 'neurocopy' | 'generator';
  selectedApiKey: HeyGenApiKey | null;
  selectedAvatar: Avatar | null;
  selectedVoice: Voice | null;
  selectedStyle: VideoStyle | null;
  subtitleCustomization?: SubtitleCustomization | null;
  generatedScript: string | null;
  cardCustomization?: CardCustomization | null;
  presenterCustomization?: PresenterCustomization | null;
  apiVersionCustomization?: ApiVersionCustomization | null;
  manualCustomization?: ManualCustomization | null;
}
