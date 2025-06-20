
import React from 'react';
import { Search } from 'lucide-react';
import { Avatar } from '@/types/videoFlow';
import AvatarCard from './AvatarCard';

interface Props {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  onSelectAvatar: (avatar: Avatar) => void;
}

const AvatarGrid: React.FC<Props> = ({ avatars, selectedAvatarId, onSelectAvatar }) => {
  if (avatars.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No se encontraron avatares en tu cuenta de HeyGen.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 px-2">
      {avatars.map((avatar) => (
        <AvatarCard
          key={avatar.avatar_id}
          avatar={avatar}
          isSelected={selectedAvatarId === avatar.avatar_id}
          onSelect={onSelectAvatar}
        />
      ))}
    </div>
  );
};

export default AvatarGrid;
