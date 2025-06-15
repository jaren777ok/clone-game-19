
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

interface Props {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const LoadMoreButton: React.FC<Props> = ({ hasMore, loadingMore, onLoadMore }) => {
  if (!hasMore) return null;

  return (
    <div className="text-center">
      <Button
        onClick={onLoadMore}
        disabled={loadingMore}
        variant="outline"
        className="cyber-border hover:cyber-glow"
      >
        {loadingMore ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Cargando más avatares...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Cargar más Avatars
          </>
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
