
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/hooks/useVideoCreationFlow';

interface Props {
  avatar: Avatar;
  isSelected: boolean;
  onSelect: (avatar: Avatar) => void;
}

const AvatarCard: React.FC<Props> = ({ avatar, isSelected, onSelect }) => {
  return (
    <Card 
      className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${
        isSelected ? 'cyber-glow-intense' : ''
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="aspect-square mb-3 sm:mb-4 rounded-lg overflow-hidden bg-muted relative">
          {isSelected && (
            <div className="absolute top-2 right-2 z-10">
              <CheckCircle2 className="w-5 h-5 text-primary bg-background rounded-full" />
            </div>
          )}
          <img
            src={avatar.preview_image_url}
            alt={avatar.avatar_name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        <h3 className="font-semibold text-center mb-3 text-sm sm:text-base truncate">
          {avatar.avatar_name}
        </h3>
        <Button
          onClick={() => onSelect(avatar)}
          className="w-full cyber-glow text-xs sm:text-sm"
          size="sm"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Continuar" : "Elegir Avatar"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvatarCard;
