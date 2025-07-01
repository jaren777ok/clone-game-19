
import React from 'react';

interface VideoPreviewProps {
  videoTitle: string;
  videoUrl: string;
}

const VideoPreview = ({ videoTitle, videoUrl }: VideoPreviewProps) => {
  return (
    <div className="bg-muted/20 rounded-lg p-4">
      <h4 className="font-medium text-foreground mb-2">Video a compartir:</h4>
      <p className="text-sm text-muted-foreground mb-2">{videoTitle}</p>
      <p className="text-xs text-muted-foreground font-mono break-all">{videoUrl}</p>
    </div>
  );
};

export default VideoPreview;
