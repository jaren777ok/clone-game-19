
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';

interface Props {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

const VoiceLoadMoreButton: React.FC<Props> = ({ hasMore, loadingMore, onLoadMore }) => {
  if (!hasMore) return null;

  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Hay más voces disponibles
        </p>
        <p className="text-xs text-muted-foreground">
          Haz clic para cargar las siguientes 12 voces
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
            Cargando más voces...
          </>
        ) : (
          <>
            <ChevronDown className="w-5 h-5 mr-2" />
            Cargar más Voces
          </>
        )}
      </Button>
    </div>
  );
};

export default VoiceLoadMoreButton;
