
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSocialPublish } from '@/hooks/useSocialPublish';
import ModalHeader from './ModalHeader';
import StepRenderer from './StepRenderer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  script: string;
}

const SocialPublishModal: React.FC<Props> = ({ isOpen, onClose, videoUrl, script }) => {
  const {
    state,
    closeModal,
    handleApiKeySaved,
    generateCaption,
    selectNetwork,
    publishToNetwork,
    updateCaption,
    navigateToSelectNetwork,
    retryFromError
  } = useSocialPublish();

  const handleClose = () => {
    closeModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader step={state.step} onClose={handleClose} />
        
        <div className="py-4">
          <StepRenderer
            state={state}
            onApiKeySaved={handleApiKeySaved}
            onGenerateCaption={generateCaption}
            onCaptionChange={updateCaption}
            onNavigateToSelectNetwork={navigateToSelectNetwork}
            onSelectNetwork={selectNetwork}
            onPublish={publishToNetwork}
            onRetry={retryFromError}
            onClose={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialPublishModal;
