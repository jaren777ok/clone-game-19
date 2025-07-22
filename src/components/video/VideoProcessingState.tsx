
import React from 'react';
import { Video, Wifi, AlertTriangle, Clock, RefreshCw, Database, Play, Zap, Heart } from 'lucide-react';
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
                ? 'Sistema mejorado verificando si tu video ya está listo...'
                : 'Sistema automático con auto-recovery y verificación directa en BD'
              }
            </p>
          </div>

          {/* 🚨 NEW: Sistema Automático MEJORADO con Auto-Recovery */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-green-400 animate-pulse" />
              <h3 className="text-xl font-semibold text-green-300">Sistema Mejorado con Auto-Recovery</h3>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-green-200">
                🚨 <strong>Verificación inmediata</strong> para videos stuck (2s)
              </p>
              <p className="text-sm text-muted-foreground">
                ⚡ Primera verificación a los 10 segundos
              </p>
              <p className="text-sm text-muted-foreground">
                🔄 Verificación automática cada 60 segundos
              </p>
              <p className="text-sm text-muted-foreground">
                💚 Health checks cada 30 segundos con auto-restart
              </p>
              <p className="text-sm text-green-300 font-medium">
                ⏰ Transcurridos: {minutesElapsed} min | Restantes: {minutesRemaining} min
              </p>
            </div>
          </div>

          {/* Enhanced Manual Check Button */}
          {onManualCheck && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-300">Verificación Manual Mejorada</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sistema mejorado con force-check para videos stuck + verificación normal.
              </p>
              <Button
                onClick={onManualCheck}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-3" />
                🚨 Verificar Ahora (Mejorado)
              </Button>
              <p className="text-xs text-blue-400">
                ✨ Incluye force-check para videos stuck + verificación normal
              </p>
            </div>
          )}

          {/* Enhanced Debug Information */}
          {debugInfo && (
            <div className="bg-card/30 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Estado del Sistema Mejorado</span>
              </div>
              <p className="text-xs text-green-200 font-mono">{debugInfo}</p>
            </div>
          )}

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* Enhanced System Information */}
          <div className="bg-card/50 cyber-border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-green-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-green-300">
                Sistema Mejorado con Auto-Recovery
              </h3>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-green-200 text-sm font-medium">
                🚨 <strong>Auto-recovery para videos stuck</strong> - verificación inmediata en 2s
              </p>
              <p className="text-muted-foreground text-sm">
                🕐 Verificación cada 60 segundos automáticamente
              </p>
              <p className="text-muted-foreground text-sm">
                💚 Health checks cada 30s con auto-restart del sistema
              </p>
              <p className="text-muted-foreground text-sm">
                📊 Consulta directa a la BD (más rápido y confiable)
              </p>
              <p className="text-muted-foreground text-sm">
                ✅ Se detendrá automáticamente cuando encuentre el video
              </p>
              <p className="text-muted-foreground text-sm">
                🚀 100% automático sin dependencias externas
              </p>
            </div>
          </div>

          {/* Enhanced Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
            <span className="text-sm text-muted-foreground">
              Sistema mejorado con auto-recovery activo - BD directa cada 60s
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
