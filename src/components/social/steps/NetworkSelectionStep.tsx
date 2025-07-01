
import React from 'react';
import SocialNetworkSelector from '../SocialNetworkSelector';
import { SocialNetwork } from '@/hooks/useSocialPublish';

interface Props {
  selectedNetwork: SocialNetwork | null;
  onSelectNetwork: (network: SocialNetwork) => void;
  onPublish: () => void;
  isLoading: boolean;
}

const NetworkSelectionStep: React.FC<Props> = ({
  selectedNetwork,
  onSelectNetwork,
  onPublish,
  isLoading
}) => {
  return (
    <SocialNetworkSelector
      selectedNetwork={selectedNetwork}
      onSelectNetwork={onSelectNetwork}
      onPublish={onPublish}
      isLoading={isLoading}
    />
  );
};

export default NetworkSelectionStep;
