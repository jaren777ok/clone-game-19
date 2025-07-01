
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isSuccess: boolean;
  error?: string | null;
  onRetry: () => void;
  onClose: () => void;
}

const PublishStatus: React.FC<Props> = ({ isSuccess, error, onRetry, onClose }) => {
  useEffect(() => {
    if (isSuccess) {
      // Trigger confetti effect
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-green-600">¡Publicado!</h2>
          <p className="text-muted-foreground text-lg">
            Tu video ha sido publicado exitosamente en la red social seleccionada
          </p>
        </div>

        <Card className="cyber-border bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <p className="text-green-700 font-medium">
              ✅ Tu contenido ya está disponible para tus seguidores
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={onClose}
          className="w-full cyber-glow"
          size="lg"
        >
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-red-600">Error en publicación</h2>
        <p className="text-muted-foreground text-lg">
          Hubo un problema al publicar tu video
        </p>
      </div>

      <Card className="cyber-border bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-700 font-medium">
            {error || 'Error desconocido. Intenta nuevamente en 5 minutos.'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar nuevamente
        </Button>
        
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full"
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default PublishStatus;
