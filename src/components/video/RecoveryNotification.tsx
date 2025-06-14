
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecoveryNotificationProps {
  onRecover: () => void;
  onCancel: () => void;
}

const RecoveryNotification = ({ onRecover, onCancel }: RecoveryNotificationProps) => {
  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Generación en progreso detectada
            </h3>
            <p className="text-muted-foreground mb-4">
              Encontramos una generación de video en curso. Tu video podría estar listo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onRecover}
                className="cyber-border hover:cyber-glow"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Estado
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="cyber-border hover:cyber-glow"
              >
                Cancelar y Empezar Nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryNotification;
