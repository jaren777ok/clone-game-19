
import React from 'react';
import { Loader2 } from 'lucide-react';
import { SocialNetwork } from '@/hooks/useSocialPublish';

interface Props {
  selectedNetwork: SocialNetwork | null;
}

const PublishingStep: React.FC<Props> = ({ selectedNetwork }) => {
  return (
    <div className="text-center py-12 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
      <h3 className="text-xl font-semibold">Publicando en {selectedNetwork}...</h3>
      <p className="text-muted-foreground">
        Esto puede tardar hasta 7 minutos. Por favor, no cierres esta ventana.
      </p>
    </div>
  );
};

export default PublishingStep;
