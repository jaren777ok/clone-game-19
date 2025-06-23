
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresenterCustomization } from '@/types/videoFlow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: PresenterCustomization) => void;
}

// Función utilitaria para transformar comillas dobles a simples
const transformQuotes = (value: string): string => {
  return value.replace(/"/g, "'");
};

const PresenterNameModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [nombrePresentador, setNombrePresentador] = useState('');

  const handleConfirm = () => {
    const customization: PresenterCustomization = {
      nombrePresentador: transformQuotes(nombrePresentador.trim())
    };
    onConfirm(customization);
  };

  const isValid = nombrePresentador.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md cyber-border cyber-gradient backdrop-blur-sm">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-background/80 hover:bg-background cyber-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gradient-safe text-center py-2">
            Personaliza el Presentador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Icono decorativo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center cyber-border">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Campo Nombre del Presentador */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="nombrePresentador" className="text-sm font-medium text-foreground">
                Nombre del Presentador
              </Label>
              <span className={cn(
                "text-xs",
                nombrePresentador.length > 21 ? "text-destructive" : "text-muted-foreground"
              )}>
                {nombrePresentador.length}/21
              </span>
            </div>
            <Input
              id="nombrePresentador"
              value={nombrePresentador}
              onChange={(e) => setNombrePresentador(transformQuotes(e.target.value.slice(0, 21)))}
              placeholder="Ingresa el nombre del presentador"
              className="cyber-border focus:cyber-glow h-12"
              maxLength={21}
            />
            <p className="text-xs text-muted-foreground">
              Este nombre aparecerá en el video como identificación del presentador
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 cyber-border hover:cyber-glow h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 cyber-glow h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresenterNameModal;
