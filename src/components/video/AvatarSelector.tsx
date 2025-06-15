
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, HeyGenApiKey } from '@/hooks/useVideoCreationFlow';
import AvatarGrid from './AvatarGrid';
import LoadMoreButton from './LoadMoreButton';
import PreviousSelectionBanner from './PreviousSelectionBanner';

interface Props {
  selectedApiKey: HeyGenApiKey;
  onSelectAvatar: (avatar: Avatar) => void;
  onBack: () => void;
}

const AvatarSelector: React.FC<Props> = ({ selectedApiKey, onSelectAvatar, onBack }) => {
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalAvatars, setTotalAvatars] = useState<number>(0);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [previouslySelectedAvatar, setPreviouslySelectedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    // Cargar selección previa del localStorage
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedAvatar) {
          setPreviouslySelectedAvatar(parsedState.selectedAvatar);
          setSelectedAvatarId(parsedState.selectedAvatar.avatar_id);
        }
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
    
    loadAvatars(0, true);
  }, [selectedApiKey]);

  const loadAvatars = async (offset: number = 0, isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Desencriptar la clave API
      const decryptedKey = atob(selectedApiKey.api_key_encrypted);

      const { data, error } = await supabase.functions.invoke('heygen-avatars', {
        body: {
          apiKey: decryptedKey,
          offset,
          limit: 12
        }
      });

      if (error) throw error;

      if (isInitial) {
        setAvatars(data.avatars || []);
        setTotalAvatars(data.total || 0);
      } else {
        setAvatars(prev => [...prev, ...(data.avatars || [])]);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los avatares. Verifica tu clave API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadAvatars(avatars.length, false);
    }
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatarId(avatar.avatar_id);
    onSelectAvatar(avatar);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando avatares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar clave API
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Usando: {selectedApiKey.api_key_name}
          </div>
        </div>

        {/* Mostrar selección previa si existe */}
        {previouslySelectedAvatar && (
          <PreviousSelectionBanner
            previouslySelectedAvatar={previouslySelectedAvatar}
            onContinueWithPrevious={handleSelectAvatar}
          />
        )}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight px-4">
              Selecciona tu Avatar
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4 leading-relaxed">
              Elige el avatar que representará tu contenido en el video
            </p>
            {/* Contador de avatares */}
            {totalAvatars > 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Mostrando {avatars.length} de {totalAvatars} avatares
              </p>
            )}
          </div>

          <AvatarGrid
            avatars={avatars}
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={handleSelectAvatar}
          />

          <LoadMoreButton
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

export default AvatarSelector;
