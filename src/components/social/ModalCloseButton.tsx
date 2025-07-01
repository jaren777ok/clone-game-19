
import React from 'react';
import { Button } from '@/components/ui/button';

interface ModalCloseButtonProps {
  onClose: () => void;
}

const ModalCloseButton = ({ onClose }: ModalCloseButtonProps) => {
  return (
    <div className="flex justify-center pt-4">
      <Button
        onClick={onClose}
        className="cyber-border hover:cyber-glow-intense"
      >
        Cerrar
      </Button>
    </div>
  );
};

export default ModalCloseButton;
