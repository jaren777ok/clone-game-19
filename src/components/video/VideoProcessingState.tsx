
import React from 'react';
import { Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';

interface VideoProcessingStateProps {
  timeRemaining: number;
  totalTime: number;
  isRecovering?: boolean;
  onManualCheck?: () => void;
  debugInfo?: string;
  isChecking?: boolean;
  canCheckVideo?: boolean;
  timeUntilButton?: number;
}

const VideoProcessingState = ({ 
  timeRemaining, 
  totalTime, 
  isRecovering, 
  onManualCheck,
  debugInfo,
  isChecking,
  canCheckVideo = false,
  timeUntilButton = 0
}: VideoProcessingStateProps) => {
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
              Tu video se está procesando.
            </p>
          </div>

          {/* Countdown Timer */}
          <CountdownTimer timeRemaining={timeRemaining} totalTime={totalTime} />

          {/* Manual Check Button - Only show when canCheckVideo is true */}
          {canCheckVideo && onManualCheck && (
            <div className="space-y-4">
              <Button
                onClick={onManualCheck}
                disabled={isChecking}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-12 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Play className="w-6 h-6 mr-3" />
                {isChecking ? 'Verificando...' : 'Verificar Video'}
              </Button>
              
              <p className="text-blue-200 text-base font-medium">
                Toca el botón para verificar si tu video ya está listo
              </p>
            </div>
          )}

          {/* System Information - Simplified */}
          <div className="bg-card/50 cyber-border border-blue-500/30 rounded-xl p-6">
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground text-sm">
                ⚡ Tu video puede estar listo antes del tiempo estimado
              </p>
              <p className="text-muted-foreground text-sm">
                🔄 Puedes cerrar la aplicación y volver más tarde
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">
              Procesando video...
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
