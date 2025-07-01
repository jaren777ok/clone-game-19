
import React from 'react';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader = ({ onClose }: ModalHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div className="flex items-center">
        <Share2 className="w-6 h-6 mr-3 text-primary" />
        <CardTitle className="text-xl">Publicar en Redes Sociales</CardTitle>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="w-4 h-4" />
      </Button>
    </CardHeader>
  );
};

export default ModalHeader;
