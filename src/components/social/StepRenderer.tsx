
import React from 'react';
import { SocialPublishState } from '@/contexts/SocialPublishContext';
import ApiKeyInputStep from './steps/ApiKeyInputStep';
import CaptionGenerationStep from './steps/CaptionGenerationStep';
import NetworkSelectionStep from './steps/NetworkSelectionStep';
import PublishingStep from './steps/PublishingStep';
import StatusStep from './steps/StatusStep';

interface Props {
  state: SocialPublishState;
  onApiKeySaved: (name: string, apiKey: string) => void;
  onGenerateCaption: () => void;
  onCaptionChange: (caption: string) => void;
  onNavigateToSelectNetwork: () => void;
  onSelectNetwork: (network: any) => void;
  onPublish: () => void;
  onRetry: () => void;
  onClose: () => void;
}

const StepRenderer: React.FC<Props> = ({
  state,
  onApiKeySaved,
  onGenerateCaption,
  onCaptionChange,
  onNavigateToSelectNetwork,
  onSelectNetwork,
  onPublish,
  onRetry,
  onClose
}) => {
  switch (state.step) {
    case 'api-key-input':
      return (
        <ApiKeyInputStep
          onApiKeySaved={onApiKeySaved}
          isLoading={state.isLoading}
          error={state.error}
        />
      );

    case 'generate-caption':
      return (
        <CaptionGenerationStep
          script={state.script}
          generatedCaption={state.generatedCaption}
          editedCaption={state.editedCaption}
          onGenerate={onGenerateCaption}
          onCaptionChange={onCaptionChange}
          onNext={onNavigateToSelectNetwork}
          isLoading={state.isLoading}
          error={state.error}
        />
      );

    case 'select-network':
      return (
        <NetworkSelectionStep
          selectedNetwork={state.selectedNetwork}
          onSelectNetwork={onSelectNetwork}
          onPublish={onPublish}
          isLoading={state.isLoading}
        />
      );

    case 'publishing':
      return (
        <PublishingStep selectedNetwork={state.selectedNetwork} />
      );

    case 'success':
      return (
        <StatusStep
          isSuccess={true}
          onRetry={onRetry}
          onClose={onClose}
        />
      );

    case 'error':
      return (
        <StatusStep
          isSuccess={false}
          error={state.error}
          onRetry={onRetry}
          onClose={onClose}
        />
      );

    default:
      return null;
  }
};

export default StepRenderer;
