
import React from 'react';
import { VideoStyle } from '@/types/videoFlow';
import VideoStyleCard from './VideoStyleCard';

interface Props {
  videoStyles: VideoStyle[];
  selectedStyleId: string | null;
  playingVideo: string | null;
  onSelectStyle: (style: VideoStyle) => void;
  onToggleVideoPlayback: (styleId: string, event: React.MouseEvent) => void;
  onVideoEnded: (styleId: string) => void;
  onVideoRef: (styleId: string) => (ref: HTMLVideoElement | null) => void;
}

const StyleGrid: React.FC<Props> = ({
  videoStyles,
  selectedStyleId,
  playingVideo,
  onSelectStyle,
  onToggleVideoPlayback,
  onVideoEnded,
  onVideoRef
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-2">
      {videoStyles.map((style) => (
        <VideoStyleCard
          key={style.id}
          style={style}
          isSelected={selectedStyleId === style.id}
          isPlaying={playingVideo === style.id}
          onSelect={onSelectStyle}
          onTogglePlay={onToggleVideoPlayback}
          onVideoEnded={onVideoEnded}
          onVideoRef={onVideoRef}
        />
      ))}
    </div>
  );
};

export default StyleGrid;
