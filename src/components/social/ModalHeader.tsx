
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SocialStep } from '@/hooks/useSocialPublish';

interface Props {
  step: SocialStep;
  onClose: () => void;
}

const ModalHeader: React.FC<Props> = ({ step, onClose }) => {
  const getTitle = () => {
    switch (step) {
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

  return (
    <DialogHeader className="flex flex-row items-center justify-between">
      <DialogTitle className="text-xl font-bold">
        {getTitle()}
      </DialogTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-6 w-6"
      >
        <X className="h-4 w-4" />
      </Button>
    </DialogHeader>
  );
};

export default ModalHeader;
