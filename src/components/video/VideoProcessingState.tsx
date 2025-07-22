
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

          {/* Manual Check Button - Enhanced with vibrant green gradient */}
          {canCheckVideo && onManualCheck && (
            <div className="space-y-6">
              {/* Container with enhanced gradient background and glow effects */}
              <div className="relative mx-auto max-w-lg">
                {/* Outer glow effect - More intense */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 rounded-3xl blur-xl opacity-90 animate-pulse"></div>
                
                {/* Secondary glow for more depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-green-400 to-emerald-500 rounded-3xl blur-lg opacity-60 animate-pulse delay-150"></div>
                
                {/* Inner container with enhanced gradient background */}
                <div className="relative bg-gradient-to-r from-green-400/30 via-green-500/40 to-emerald-600/30 p-8 rounded-3xl border-2 border-green-400/60 backdrop-blur-sm shadow-2xl shadow-green-500/40">
                  <Button
                    onClick={onManualCheck}
                    disabled={isChecking}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 hover:from-green-500 hover:via-green-600 hover:to-emerald-700 focus:from-green-500 focus:via-green-600 focus:to-emerald-700 text-white font-black py-6 px-16 rounded-2xl shadow-2xl shadow-green-500/60 transform hover:scale-110 focus:scale-110 transition-all duration-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-0 relative overflow-hidden ring-2 ring-green-400/50 hover:ring-green-300/70 focus:ring-green-300/70"
                  >
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-[shimmer_1.5s_infinite]"></div>
                    
                    {/* Pulsing background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 via-green-400/30 to-emerald-500/20 animate-pulse"></div>
                    
                    <Play className="w-7 h-7 mr-4 relative z-10 drop-shadow-lg" />
                    <span className="relative z-10 drop-shadow-lg tracking-wide">
                      {isChecking ? 'Verificando...' : 'Verificar Video'}
                    </span>
                  </Button>
                </div>
              </div>
              
              <p className="text-green-200 text-lg font-bold animate-pulse bg-gradient-to-r from-green-200 via-green-300 to-emerald-300 bg-clip-text text-transparent">
                ✨ Toca el botón para verificar si tu video ya está listo ✨
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
