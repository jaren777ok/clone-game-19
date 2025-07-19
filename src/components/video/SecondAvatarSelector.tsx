
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, HeyGenApiKey } from '@/types/videoFlow';
import AvatarGrid from './AvatarGrid';
import LoadMoreButton from './LoadMoreButton';

interface Props {
  selectedApiKey: HeyGenApiKey;
  selectedFirstAvatar: Avatar;
  onSelectSecondAvatar: (avatar: Avatar) => void;
  onBack: () => void;
}

const SecondAvatarSelector: React.FC<Props> = ({ 
  selectedApiKey, 
  selectedFirstAvatar, 
  onSelectSecondAvatar, 
  onBack 
}) => {
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalAvatars, setTotalAvatars] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  const AVATARS_PER_PAGE = 12;

  useEffect(() => {
    loadAvatars(0, true);
  }, [selectedApiKey]);

  const loadAvatars = async (offset: number = 0, isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
      setAvatars([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const decryptedKey = atob(selectedApiKey.api_key_encrypted);

      const { data, error } = await supabase.functions.invoke('heygen-avatars', {
        body: {
          apiKey: decryptedKey,
          offset,
          limit: AVATARS_PER_PAGE
        }
      });

      if (error) throw error;

      if (isInitial) {
        setAvatars(data.avatars || []);
        setTotalAvatars(data.total || 0);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
      } else {
        setAvatars(prev => [...prev, ...(data.avatars || [])]);
        setCurrentPage(data.currentPage || currentPage + 1);
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
      const nextOffset = avatars.length;
      loadAvatars(nextOffset, false);
    }
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    if (avatar.avatar_id === selectedFirstAvatar.avatar_id) {
      toast({
        title: "Avatar ya seleccionado",
        description: "Este avatar ya fue seleccionado como primer avatar. Elige uno diferente.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedAvatarId(avatar.avatar_id);
    onSelectSecondAvatar(avatar);
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
            Cambiar primer avatar
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Usando: {selectedApiKey.api_key_name}
          </div>
        </div>

        {/* Mostrar información del primer avatar seleccionado */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-card border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={selectedFirstAvatar.preview_image_url} 
                alt={selectedFirstAvatar.avatar_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm text-muted-foreground">Avatar 1 seleccionado:</p>
                <p className="font-medium text-foreground">{selectedFirstAvatar.avatar_name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight pb-2">
              Selecciona el Segundo Avatar
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Elige el segundo avatar para el estilo Multi-Avatar
            </p>
            {totalAvatars > 0 && (
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <p>Mostrando {avatars.length} de {totalAvatars} avatares</p>
                {totalPages > 1 && (
                  <p>Página {Math.ceil(avatars.length / AVATARS_PER_PAGE)} de {totalPages}</p>
                )}
              </div>
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

export default SecondAvatarSelector;
