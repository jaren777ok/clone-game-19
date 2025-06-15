
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';

interface Props {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const LoadMoreButton: React.FC<Props> = ({ hasMore, loadingMore, onLoadMore }) => {
  if (!hasMore) return null;

  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Hay más avatares disponibles
        </p>
        <p className="text-xs text-muted-foreground">
          Haz clic para cargar los siguientes 12 avatares
        </p>
      </div>
      <Button
        onClick={onLoadMore}
        disabled={loadingMore}
        variant="default"
        size="lg"
        className="cyber-border hover:cyber-glow px-8 py-3"
      >
        {loadingMore ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Cargando más avatares...
          </>
        ) : (
          <>
            <ChevronDown className="w-5 h-5 mr-2" />
            Cargar más Avatares
          </>
        )}
      </Button>
    </div>
  );
};

export default LoadMoreButton;
