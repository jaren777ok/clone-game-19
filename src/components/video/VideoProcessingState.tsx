
import React from 'react';
import { Video, Wifi, AlertTriangle, Clock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { hasReachedPollingTime } from '@/lib/countdownUtils';

interface VideoProcessingStateProps {
  timeRemaining: number;
  totalTime: number;
  isRecovering?: boolean;
}

const VideoProcessingState = ({ timeRemaining, totalTime, isRecovering }: VideoProcessingStateProps) => {
  const startTime = Date.now() - (totalTime - timeRemaining) * 1000;
  const isInPollingPhase = hasReachedPollingTime(startTime);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-16">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          {/* Main Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto animate-cyber-pulse">
              {isRecovering ? (
                <Wifi className="w-12 h-12 text-background" />
              ) : isInPollingPhase ? (
                <Clock className="w-12 h-12 text-background" />
              ) : (
                <Video className="w-12 h-12 text-background" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              {isRecovering ? 'Verificando Video' : isInPollingPhase ? 'Verificando Resultado' : 'Generando tu Video'}
            </h1>
            
            <p className="text-muted-foreground text-lg">
              {isRecovering 
                ? 'Verificando si tu video ya está listo en segundo plano...'
                : isInPollingPhase
                ? 'Verificando cada minuto si tu video está disponible...'
                : 'Nuestro sistema está procesando tu solicitud con inteligencia artificial'
              }
            </p>
          </div>

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* Phase-specific Information */}
          <div className="bg-card/50 cyber-border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-amber-300">
                {isInPollingPhase ? 'Fase de Verificación Activa' : 'Información del Proceso'}
              </h3>
            </div>
            <div className="space-y-3 text-center">
              {isInPollingPhase ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    🔍 Verificando cada minuto si tu video está disponible
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ⚡ Tu video debería estar disponible pronto
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ⏰ Tiempo restante: {minutesRemaining} minutos
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    🎬 Generando video (primeros 30 minutos)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    🕒 Las verificaciones iniciarán automáticamente a los 30 minutos
                  </p>
                  <p className="text-muted-foreground text-sm">
                    💻 Puedes cerrar la app y volver luego
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isInPollingPhase ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isInPollingPhase 
                ? 'Verificación activa cada minuto' 
                : 'Sistema de generación en proceso'
              }
            </span>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-float delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-primary/5 rounded-full blur-lg animate-float delay-500"></div>
    </div>
  );
};

export default VideoProcessingState;
