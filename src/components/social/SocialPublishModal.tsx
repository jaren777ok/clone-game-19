
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocialPublish } from '@/hooks/useSocialPublish';
import BlotatomApiKeyForm from './BlotatomApiKeyForm';
import CaptionGenerator from './CaptionGenerator';
import SocialNetworkSelector from './SocialNetworkSelector';
import PublishStatus from './PublishStatus';

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
    retryFromError
  } = useSocialPublish();

  React.useEffect(() => {
    if (isOpen && videoUrl && script) {
      // This will be handled by the parent component calling openModal
    }
  }, [isOpen, videoUrl, script]);

  const handleClose = () => {
    closeModal();
    onClose();
  };

  const renderStep = () => {
    switch (state.step) {
      case 'api-key-check':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando configuración...</p>
          </div>
        );

      case 'api-key-input':
        return (
          <BlotatomApiKeyForm
            onSave={handleApiKeySaved}
            isLoading={state.isLoading}
            error={state.error}
          />
        );

      case 'generate-caption':
        return (
          <CaptionGenerator
            script={state.script}
            generatedCaption={state.generatedCaption}
            editedCaption={state.editedCaption}
            onGenerate={generateCaption}
            onCaptionChange={updateCaption}
            onNext={() => setState(prev => ({ ...prev, step: 'select-network' }))}
            isLoading={state.isLoading}
            error={state.error}
          />
        );

      case 'select-network':
        return (
          <SocialNetworkSelector
            selectedNetwork={state.selectedNetwork}
            onSelectNetwork={selectNetwork}
            onPublish={publishToNetwork}
            isLoading={state.isLoading}
          />
        );

      case 'publishing':
        return (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Publicando en {state.selectedNetwork}...</h3>
            <p className="text-muted-foreground">
              Esto puede tardar hasta 7 minutos. Por favor, no cierres esta ventana.
            </p>
          </div>
        );

      case 'success':
        return (
          <PublishStatus
            isSuccess={true}
            onRetry={retryFromError}
            onClose={handleClose}
          />
        );

      case 'error':
        return (
          <PublishStatus
            isSuccess={false}
            error={state.error}
            onRetry={retryFromError}
            onClose={handleClose}
          />
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (state.step) {
      case 'api-key-input':
        return 'Configurar Blotato';
      case 'generate-caption':
        return 'Generar Caption';
      case 'select-network':
        return 'Seleccionar Red Social';
      case 'publishing':
        return 'Publicando...';
      case 'success':
        return '¡Éxito!';
      case 'error':
        return 'Error';
      default:
        return 'Publicar en Redes';
    }
  };

  // Don't use the state.isOpen, use the prop directly
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">
            {getTitle()}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialPublishModal;
