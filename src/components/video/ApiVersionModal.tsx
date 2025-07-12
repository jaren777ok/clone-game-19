import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ApiVersionCustomization } from '@/types/videoFlow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: ApiVersionCustomization) => void;
}

const ApiVersionModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const handleConfirm = () => {
    if (!selectedVersion) return;
    
    const isPaidVersion = selectedVersion === 'paid';
    const customization: ApiVersionCustomization = {
      isPaidVersion,
      width: isPaidVersion ? 1920 : 1280,
      height: isPaidVersion ? 1080 : 720
    };
    
    onConfirm(customization);
    setSelectedVersion('');
  };

  const handleClose = () => {
    setSelectedVersion('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-center">
            ¿TIENES LA VERSIÓN PAGA DE LA API DE HEYGEN?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <RadioGroup 
            value={selectedVersion} 
            onValueChange={setSelectedVersion}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
              <RadioGroupItem value="paid" id="paid" />
              <Label 
                htmlFor="paid" 
                className="text-lg font-medium cursor-pointer flex-1"
              >
                Sí, tengo el plan de API
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/20 hover:border-primary/30 transition-colors">
              <RadioGroupItem value="free" id="free" />
              <Label 
                htmlFor="free" 
                className="text-lg font-medium cursor-pointer flex-1"
              >
                Aún no, tengo la versión GRATIS
              </Label>
            </div>
          </RadioGroup>

          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              Si marcas la casilla equivocada tu video no se generará por temas de HeyGen
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedVersion}
              className="px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiVersionModal;