import React, { useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoStyle } from '@/types/videoFlow';

interface Props {
  styles: VideoStyle[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  playingVideo: string | null;
  onTogglePlay: (styleId: string) => void;
}

const StyleCarousel: React.FC<Props> = ({
  styles,
  activeIndex,
  onActiveIndexChange,
  playingVideo,
  onTogglePlay,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    containScroll: false,
    skipSnaps: false,
  });

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Handle slide selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    onActiveIndexChange(index);
  }, [emblaApi, onActiveIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play active video
  useEffect(() => {
    const activeStyle = styles[activeIndex];
    if (!activeStyle) return;

    // Pause all videos first
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Play the active video
    const activeVideo = videoRefs.current[activeStyle.id];
    if (activeVideo) {
      activeVideo.play().catch(console.error);
    }
  }, [activeIndex, styles]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleVideoClick = (styleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePlay(styleId);
    
    const video = videoRefs.current[styleId];
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 border border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-8 h-8 text-primary" />
      </Button>
      
      <Button
        variant="ghost"
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 border border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-8 h-8 text-primary" />
      </Button>

      {/* Carousel Container */}
      <div className="overflow-hidden w-full px-20" ref={emblaRef}>
        <div className="flex items-center gap-4">
          {styles.map((style, index) => {
            const isActive = index === activeIndex;
            const isPlaying = playingVideo === style.id;
            
            return (
              <div
                key={style.id}
                className={`
                  flex-[0_0_280px] transition-all duration-500 ease-out cursor-pointer
                  ${isActive 
                    ? 'scale-100 opacity-100 z-10' 
                    : 'scale-75 opacity-40 z-0 blur-[1px]'
                  }
                `}
                onClick={() => scrollTo(index)}
              >
                {/* Video Container with Gradient Border */}
                <div 
                  className={`
                    relative rounded-2xl overflow-hidden transition-all duration-500
                    ${isActive 
                      ? 'p-[3px] bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/30' 
                      : 'p-[1px] bg-border/30'
                    }
                  `}
                >
                  <div className="relative bg-background rounded-xl overflow-hidden aspect-[9/16]">
                    <video
                      ref={(el) => { videoRefs.current[style.id] = el; }}
                      src={style.video_url}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                    
                    {/* Play/Pause Overlay */}
                    <div 
                      className={`
                        absolute inset-0 flex items-center justify-center bg-black/20
                        transition-opacity duration-300
                        ${isActive ? 'opacity-0 hover:opacity-100' : 'opacity-0'}
                      `}
                      onClick={(e) => isActive && handleVideoClick(style.id, e)}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Style Name Badge */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className={`
                        px-4 py-2 rounded-xl backdrop-blur-md text-center transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary/80 to-accent/80 text-white' 
                          : 'bg-black/40 text-white/80'
                        }
                      `}>
                        <span className="text-sm font-semibold">{style.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {styles.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`
              h-2.5 rounded-full transition-all duration-300
              ${index === activeIndex 
                ? 'w-8 bg-gradient-to-r from-primary to-accent' 
                : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;
