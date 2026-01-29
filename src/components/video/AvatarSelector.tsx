import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, HeyGenApiKey } from '@/types/videoFlow';
import AvatarCarousel from './AvatarCarousel';
import AvatarLeftPanel from './AvatarLeftPanel';
import LoadMoreButton from './LoadMoreButton';
import PreviousSelectionBanner from './PreviousSelectionBanner';

// Background video URL (same as StyleSelector)
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3NDg1MzI3MTAsImV4cCI6MTc4MDA2ODcxMH0.Rj3APPFjHJzePYFCRIu5b96E8wLf4pqYLHrk9E2ri6Q';

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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [previouslySelectedAvatar, setPreviouslySelectedAvatar] = useState<Avatar | null>(null);

  const AVATARS_PER_PAGE = 24;

  useEffect(() => {
    // Load previous selection from localStorage
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedAvatar) {
          setPreviouslySelectedAvatar(parsedState.selectedAvatar);
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
      setAvatars([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const decryptedKey = atob(selectedApiKey.api_key_encrypted);

      console.log(`Loading avatars: offset=${offset}, limit=${AVATARS_PER_PAGE}`);

      const { data, error } = await supabase.functions.invoke('heygen-avatars', {
        body: {
          apiKey: decryptedKey,
          offset,
          limit: AVATARS_PER_PAGE
        }
      });

      if (error) throw error;

      console.log(`Received ${data.avatars?.length || 0} avatars from API`);

      if (isInitial) {
        setAvatars(data.avatars || []);
        setTotalAvatars(data.total || 0);
      } else {
        setAvatars(prev => {
          const newAvatars = [...prev, ...(data.avatars || [])];
          console.log(`Total avatars after adding more: ${newAvatars.length}`);
          return newAvatars;
        });
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
      console.log(`Loading more avatars from offset: ${nextOffset}`);
      loadAvatars(nextOffset, false);
    }
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    onSelectAvatar(avatar);
  };

  const handleContinueWithPrevious = (avatar: Avatar) => {
    // Find the index of the previously selected avatar if it exists in current list
    const index = avatars.findIndex(a => a.avatar_id === avatar.avatar_id);
    if (index !== -1) {
      setActiveIndex(index);
    }
    handleSelectAvatar(avatar);
  };

  const activeAvatar = avatars[activeIndex] || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        
        <div className="text-center relative z-10">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando avatares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src={BACKGROUND_VIDEO_URL} type="video/mp4" />
      </video>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel */}
        <AvatarLeftPanel
          activeAvatar={activeAvatar}
          selectedApiKey={selectedApiKey}
          totalAvatars={totalAvatars}
          avatarsLoaded={avatars.length}
          onSelectAvatar={handleSelectAvatar}
          onBack={onBack}
        />
        
        {/* Right Panel - Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          {/* Previous Selection Banner */}
          {previouslySelectedAvatar && (
            <div className="w-full max-w-4xl mb-4">
              <PreviousSelectionBanner
                previouslySelectedAvatar={previouslySelectedAvatar}
                onContinueWithPrevious={handleContinueWithPrevious}
              />
            </div>
          )}
          
          {/* Carousel */}
          <div className="w-full max-w-5xl">
            <AvatarCarousel
              avatars={avatars}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              onSelectAvatar={handleSelectAvatar}
            />
          </div>
          
          {/* Load More Button */}
          <div className="mt-6">
            <LoadMoreButton
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
