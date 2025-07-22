
import React from 'react';
import { Video, Wifi, AlertTriangle, Clock, RefreshCw, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import { hasReachedPollingTime } from '@/lib/countdownUtils';

interface VideoProcessingStateProps {
  timeRemaining: number;
  totalTime: number;
  isRecovering?: boolean;
  onManualCheck?: () => void;
  debugInfo?: string;
}

const VideoProcessingState = ({ 
  timeRemaining, 
  totalTime, 
  isRecovering, 
  onManualCheck,
  debugInfo 
}: VideoProcessingStateProps) => {
  const startTime = Date.now() - (totalTime - timeRemaining) * 1000;
  const isInPollingPhase = hasReachedPollingTime(startTime);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const minutesElapsed = Math.floor((totalTime - timeRemaining) / 60);
  
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
                <Globe className="w-12 h-12 text-background" />
              ) : (
                <Video className="w-12 h-12 text-background" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              {isRecovering ? 'Verificando Video' : isInPollingPhase ? 'Verificando via Webhook' : 'Generando tu Video'}
            </h1>
            
            <p className="text-muted-foreground text-lg">
              {isRecovering 
                ? 'Verificando si tu video ya está listo en segundo plano...'
                : isInPollingPhase
                ? 'Sistema verificando automáticamente cada minuto via webhook externa...'
                : 'Nuestro sistema está procesando tu solicitud con inteligencia artificial'
              }
            </p>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-card/30 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Estado del Sistema</span>
              </div>
              <p className="text-xs text-blue-200 font-mono">{debugInfo}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Minutos transcurridos: {minutesElapsed} | Verificación automática: {isInPollingPhase ? 'ACTIVA' : 'PENDIENTE'}
              </p>
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* Manual Check Button - Always visible for testing */}
          {onManualCheck && (
            <div className="flex justify-center space-x-4">
              <Button
                onClick={onManualCheck}
                variant="outline"
                className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-2" />
                Verificar Manualmente
              </Button>
            </div>
          )}

          {/* Phase-specific Information */}
          <div className="bg-card/50 cyber-border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-amber-300">
                {isInPollingPhase ? 'Verificación Webhook Activa' : 'Información del Proceso'}
              </h3>
            </div>
            <div className="space-y-3 text-center">
              {isInPollingPhase ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    🌐 Verificación automática cada minuto + respaldo cada 30 segundos
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ⚡ Sistema mejorado con verificación inmediata y doble respaldo
                  </p>
                  <p className="text-muted-foreground text-sm">
                    🔍 Botón manual disponible para verificación instantánea
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ⏰ Tiempo restante: {minutesRemaining} min | Transcurridos: {minutesElapsed} min
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    🎬 Generando video (primeros 30 segundos)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    🕒 Verificaciones webhook iniciarán en 30 segundos
                  </p>
                  <p className="text-muted-foreground text-sm">
                    🔍 Botón manual ya disponible para pruebas
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isInPollingPhase ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isInPollingPhase 
                ? 'Sistema webhook activo (cada minuto + respaldo)' 
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
