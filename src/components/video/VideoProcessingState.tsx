
import React from 'react';
import { Video, Wifi, AlertTriangle, Clock, RefreshCw, Globe, Play, Zap } from 'lucide-react';
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
              ) : (
                <Video className="w-12 h-12 text-background" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              {isRecovering ? 'Verificando Video' : 'Generando tu Video'}
            </h1>
            
            <p className="text-muted-foreground text-lg">
              {isRecovering 
                ? 'Verificando si tu video ya está listo en segundo plano...'
                : 'Sistema automático verificando cada minuto - sin intervención manual requerida'
              }
            </p>
          </div>

          {/* Sistema Automático Info */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
              <h3 className="text-xl font-semibold text-blue-300">Sistema Automático Activo</h3>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                🔄 Verificación automática cada 60 segundos
              </p>
              <p className="text-sm text-muted-foreground">
                ⚡ Primera verificación a los 10 segundos
              </p>
              <p className="text-sm text-muted-foreground">
                🎯 El video se detectará automáticamente cuando esté listo
              </p>
              <p className="text-sm text-blue-300 font-medium">
                ⏰ Transcurridos: {minutesElapsed} min | Restantes: {minutesRemaining} min
              </p>
            </div>
          </div>

          {/* BOTÓN MANUAL COMO BACKUP */}
          {onManualCheck && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Verificación Manual (Backup)</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                El sistema verifica automáticamente, pero puedes forzar una verificación manual si lo deseas.
              </p>
              <Button
                onClick={onManualCheck}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-3" />
                🔍 Verificar Ahora (Manual)
              </Button>
              <p className="text-xs text-green-400">
                ✨ Solo como backup - el sistema automático es el principal
              </p>
            </div>
          )}

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-card/30 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Estado del Sistema Automático</span>
              </div>
              <p className="text-xs text-blue-200 font-mono">{debugInfo}</p>
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* Automatic System Information */}
          <div className="bg-card/50 cyber-border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-blue-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-blue-300">
                Sistema Automático en Funcionamiento
              </h3>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground text-sm">
                🕐 Verificación cada 60 segundos automáticamente
              </p>
              <p className="text-muted-foreground text-sm">
                🔍 No requiere intervención manual - totalmente automático
              </p>
              <p className="text-muted-foreground text-sm">
                ✅ Se detendrá automáticamente cuando encuentre el video
              </p>
              <p className="text-muted-foreground text-sm">
                📊 Estado: {minutesElapsed} min transcurridos, verificando cada minuto
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">
              Sistema automático verificando cada 60 segundos
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
