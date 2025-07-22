
import React from 'react';
import { Video, AlertTriangle, Clock, Database, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';

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
              <Video className="w-12 h-12 text-background" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              Generando tu Video
            </h1>
            
            <p className="text-muted-foreground text-lg">
              Sistema manual - verifica el estado cuando desees usando el botón
            </p>
          </div>

          {/* Sistema Manual Information */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-blue-300">Sistema Manual de Verificación</h3>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-blue-200">
                ⏰ <strong>Sin verificaciones automáticas</strong> - solo cuando presiones el botón
              </p>
              <p className="text-sm text-muted-foreground">
                🎯 Verificación dirigida a webhook externa especializada
              </p>
              <p className="text-sm text-green-300 font-medium">
                ⏰ Transcurridos: {minutesElapsed} min | Restantes: {minutesRemaining} min
              </p>
            </div>
          </div>

          {/* Manual Check Button */}
          {onManualCheck && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Play className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Verificación Manual</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Presiona el botón para enviar los datos de tu video a la webhook de verificación externa.
              </p>
              <Button
                onClick={onManualCheck}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-3" />
                Verificar Video
              </Button>
              <p className="text-xs text-green-400">
                ✨ Envía requestId, userId y script a webhook externa
              </p>
            </div>
          )}

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-card/30 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Estado del Sistema Manual</span>
              </div>
              <p className="text-xs text-blue-200 font-mono">{debugInfo}</p>
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* System Information */}
          <div className="bg-card/50 cyber-border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-300">
                Sistema Manual de Verificación
              </h3>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-blue-200 text-sm font-medium">
                🎯 <strong>Verificación completamente manual</strong> - sin automatizaciones
              </p>
              <p className="text-muted-foreground text-sm">
                📤 El botón envía datos a webhook externa especializada
              </p>
              <p className="text-muted-foreground text-sm">
                ⏰ Countdown de 39 minutos para referencia temporal
              </p>
              <p className="text-muted-foreground text-sm">
                🎛️ Tú decides cuándo verificar el estado de tu video
              </p>
              <p className="text-muted-foreground text-sm">
                🔗 Webhook: videogenerado - maneja la verificación externa
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">
              Sistema manual activo - verifica cuando desees
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
