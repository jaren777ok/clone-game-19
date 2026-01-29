import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/types/videoFlow';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Props {
  avatars: Avatar[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelectAvatar: (avatar: Avatar) => void;
}

const AvatarCarousel: React.FC<Props> = ({
  avatars,
  activeIndex,
  onActiveIndexChange,
  onSelectAvatar,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Handle slide selection
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap();
      onActiveIndexChange(index);
    };

    api.on('select', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onActiveIndexChange]);

  // Auto-play active video when available
  useEffect(() => {
    const activeAvatar = avatars[activeIndex];
    if (!activeAvatar) return;

    // Pause all videos first
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Play the active video if it exists
    const activeVideo = videoRefs.current[activeAvatar.avatar_id];
    if (activeVideo) {
      activeVideo.play().catch(console.error);
    }
  }, [activeIndex, avatars]);

  const scrollPrev = () => {
    if (api) api.scrollPrev();
  };

  const scrollNext = () => {
    if (api) api.scrollNext();
  };

  const scrollTo = (index: number) => {
    if (api) api.scrollTo(index);
  };

  // Calculate visible dot range (show max 10 dots at a time)
  const maxVisibleDots = 10;
  const halfVisible = Math.floor(maxVisibleDots / 2);
  let startDot = Math.max(0, activeIndex - halfVisible);
  let endDot = Math.min(avatars.length, startDot + maxVisibleDots);
  if (endDot === avatars.length) {
    startDot = Math.max(0, endDot - maxVisibleDots);
  }
  const visibleDots = avatars.slice(startDot, endDot);

  if (avatars.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No hay avatares disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3-Column Layout: [Prev Button] [Carousel] [Next Button] */}
      <div className="w-full grid grid-cols-[48px_1fr_48px] lg:grid-cols-[64px_1fr_64px] items-center gap-2">
        {/* Left Navigation Button */}
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            onClick={scrollPrev}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background/80 hover:bg-background border border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/60 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </Button>
        </div>

        {/* Carousel Container */}
        <div className="w-full overflow-hidden">
          <Carousel
            opts={{
              align: 'center',
              loop: true,
              dragFree: false,
              skipSnaps: false,
            }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4 select-none cursor-grab active:cursor-grabbing touch-pan-y">
              {avatars.map((avatar, index) => {
                const isActive = index === activeIndex;
                
                return (
                  <CarouselItem
                    key={avatar.avatar_id}
                    className="pl-4 basis-[200px] md:basis-[240px] lg:basis-[280px]"
                  >
                    <div
                      className={`
                        transition-all duration-500 ease-out cursor-pointer flex flex-col items-center select-none
                        ${isActive 
                          ? 'scale-100 opacity-100 z-10' 
                          : 'scale-75 opacity-40 z-0 blur-[1px]'
                        }
                      `}
                      onClick={() => isActive ? onSelectAvatar(avatar) : scrollTo(index)}
                    >
                      {/* Avatar Name ABOVE the image */}
                      <div className={`
                        mb-3 px-4 py-1.5 rounded-lg transition-all duration-300 text-center max-w-full
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary to-accent text-white font-bold text-sm lg:text-base shadow-lg shadow-primary/20' 
                          : 'text-muted-foreground/70 font-medium text-xs lg:text-sm'
                        }
                      `}>
                        <span className="truncate block">{avatar.avatar_name}</span>
                      </div>

                      {/* Avatar Container with Gradient Border */}
                      <div 
                        className={`
                          relative rounded-2xl overflow-hidden transition-all duration-500
                          ${isActive 
                            ? 'p-[3px] bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/30' 
                            : 'p-[1px] bg-border/30'
                          }
                        `}
                      >
                        <div className="relative bg-background rounded-xl overflow-hidden aspect-square w-[160px] md:w-[200px] lg:w-[240px]">
                          {/* Video or Image */}
                          {avatar.preview_video_url && isActive ? (
                            <video
                              ref={(el) => { videoRefs.current[avatar.avatar_id] = el; }}
                              src={avatar.preview_video_url}
                              className="w-full h-full object-cover pointer-events-none"
                              loop
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={avatar.preview_image_url}
                              alt={avatar.avatar_name}
                              className="w-full h-full object-cover pointer-events-none"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          )}
                          
                          {/* Click to select overlay for active avatar */}
                          {isActive && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors duration-300 pointer-events-auto"
                            >
                              <span className="opacity-0 hover:opacity-100 text-white font-semibold text-sm bg-primary/80 px-3 py-1.5 rounded-full transition-opacity duration-300">
                                Click para elegir
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Right Navigation Button */}
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            onClick={scrollNext}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background/80 hover:bg-background border border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/60 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </Button>
        </div>
      </div>

      {/* Dot Indicators with scroll window */}
      <div className="flex items-center justify-center gap-1.5 mt-6 lg:mt-8">
        {startDot > 0 && (
          <span className="text-muted-foreground/50 text-xs mr-1">...</span>
        )}
        {visibleDots.map((_, idx) => {
          const actualIndex = startDot + idx;
          return (
            <button
              key={actualIndex}
              onClick={() => scrollTo(actualIndex)}
              className={`
                h-2 lg:h-2.5 rounded-full transition-all duration-300
                ${actualIndex === activeIndex 
                  ? 'w-6 lg:w-8 bg-gradient-to-r from-primary to-accent' 
                  : 'w-2 lg:w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }
              `}
            />
          );
        })}
        {endDot < avatars.length && (
          <span className="text-muted-foreground/50 text-xs ml-1">...</span>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-3 text-xs text-muted-foreground">
        {activeIndex + 1} / {avatars.length}
      </div>
    </div>
  );
};

export default AvatarCarousel;
