import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Voice, HeyGenApiKey } from '@/types/videoFlow';
import VoiceGrid from './VoiceGrid';
import VoiceLoadMoreButton from './VoiceLoadMoreButton';

interface Props {
  selectedApiKey: HeyGenApiKey;
  onSelectVoice: (voice: Voice) => void;
  onBack: () => void;
}

const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3MTYyNzQsImV4cCI6MTkyNzM5NjI3NH0.WY9BkeYyf8U0doTqKMBmXo0X_2pecKTwDy3tMN7VKHY';

const VoiceSelector: React.FC<Props> = ({ selectedApiKey, onSelectVoice, onBack }) => {
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalVoices, setTotalVoices] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previouslySelectedVoice, setPreviouslySelectedVoice] = useState<Voice | null>(null);

  const VOICES_PER_PAGE = 12;

  useEffect(() => {
    // Cargar selección previa del localStorage
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedVoice) {
          setPreviouslySelectedVoice(parsedState.selectedVoice);
          setSelectedVoiceId(parsedState.selectedVoice.voice_id);
        }
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
    
    loadVoices(0, true);
  }, [selectedApiKey]);

  const loadVoices = async (offset: number = 0, isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
      setVoices([]); // Limpiar voces existentes
    } else {
      setLoadingMore(true);
    }

    try {
      // Desencriptar la clave API
      const decryptedKey = atob(selectedApiKey.api_key_encrypted);

      console.log(`Loading voices: offset=${offset}, limit=${VOICES_PER_PAGE}`);

      const { data, error } = await supabase.functions.invoke('heygen-voices', {
        body: {
          apiKey: decryptedKey,
          offset,
          limit: VOICES_PER_PAGE
        }
      });

      if (error) throw error;

      console.log(`Received ${data.voices?.length || 0} voices from API`);

      if (isInitial) {
        setVoices(data.voices || []);
        setTotalVoices(data.total || 0);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
      } else {
        setVoices(prev => {
          const newVoices = [...prev, ...(data.voices || [])];
          console.log(`Total voices after adding more: ${newVoices.length}`);
          return newVoices;
        });
        setCurrentPage(data.currentPage || currentPage + 1);
      }

      setHasMore(data.hasMore || false);
      
    } catch (error) {
      console.error('Error loading voices:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las voces. Verifica tu clave API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextOffset = voices.length;
      console.log(`Loading more voices from offset: ${nextOffset}`);
      loadVoices(nextOffset, false);
    }
  };

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoiceId(voice.voice_id);
    onSelectVoice(voice);
  };

  const handleTogglePlay = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voiceId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando voces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Video Background */}
      <video
        src={BACKGROUND_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-background/50" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar avatar
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Usando: {selectedApiKey.api_key_name}
          </div>
        </div>

        {/* Mostrar selección previa si existe */}
        {previouslySelectedVoice && (
          <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">Selección anterior</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tienes <strong>{previouslySelectedVoice.voice_name}</strong> seleccionada previamente. 
                Puedes continuar con esta selección o elegir una voz diferente.
              </p>
              <Button
                onClick={() => handleSelectVoice(previouslySelectedVoice)}
                className="cyber-glow text-sm"
                size="sm"
              >
                Continuar con {previouslySelectedVoice.voice_name}
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight px-4">
              Selecciona tu Voz
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4 leading-relaxed">
              Elige la voz que narrará tu contenido en el video
            </p>
            {/* Contador de voces con información de paginación */}
            {totalVoices > 0 && (
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <p>Mostrando {voices.length} de {totalVoices} voces</p>
                {totalPages > 1 && (
                  <p>Página {Math.ceil(voices.length / VOICES_PER_PAGE)} de {totalPages}</p>
                )}
              </div>
            )}
          </div>

          <VoiceGrid
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            playingVoiceId={playingVoiceId}
            onSelectVoice={handleSelectVoice}
            onTogglePlay={handleTogglePlay}
          />

          <VoiceLoadMoreButton
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VoiceSelector;
