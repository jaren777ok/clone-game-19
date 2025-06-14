import React from 'react';
import { Loader2, Video, Sparkles, Clock, Wifi, AlertTriangle } from 'lucide-react';

interface VideoLoadingStateProps {
  elapsedTime?: string;
  isRecovering?: boolean;
}

const VideoLoadingState = ({ elapsedTime, isRecovering }: VideoLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Main loading animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-6 animate-cyber-pulse">
            {isRecovering ? (
              <Wifi className="w-16 h-16 text-background" />
            ) : (
              <Video className="w-16 h-16 text-background" />
            )}
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute -top-4 -right-4 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -bottom-4 -left-4 animate-bounce delay-300">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="absolute top-1/2 -right-8 animate-bounce delay-500">
            <Sparkles className="w-5 h-5 text-primary/70" />
          </div>
        </div>

        {/* Loading text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
          {isRecovering ? 'Recuperando tu Video' : 'Generando tu Video'}
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          {isRecovering 
            ? 'Verificando si tu video ya está listo...'
            : 'Nuestra IA está procesando tu guion y creando un video único para ti'
          }
        </p>

        {/* Elapsed time display */}
        {elapsedTime && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-lg font-mono text-foreground">{elapsedTime}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tiempo transcurrido (máximo: 30 minutos)
            </p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground font-medium">
              {isRecovering ? 'Verificando...' : 'Procesando...'}
            </span>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Steps animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: 1, title: "Analizando Guion", icon: "📝", active: !isRecovering },
            { step: 2, title: "Generando Escenas", icon: "🎬", active: !isRecovering },
            { step: 3, title: "Finalizando Video", icon: "✨", active: false }
          ].map((item) => (
            <div 
              key={item.step}
              className={`bg-card cyber-border rounded-xl p-4 transition-all duration-500 ${
                item.active ? 'cyber-glow opacity-100' : 'opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
            </div>
          ))}
        </div>

        {/* Enhanced motivational messages */}
        <div className="mt-12 space-y-3">
          <p className="text-muted-foreground text-sm">
            ⚡ La generación puede tomar hasta 30 minutos
          </p>
          <p className="text-muted-foreground text-sm">
            🔄 El sistema verificará automáticamente el progreso
          </p>
          <p className="text-muted-foreground text-sm">
            🎯 Cuanto más detallado sea tu guion, mejor será el resultado
          </p>
          {isRecovering && (
            <p className="text-blue-400 text-sm font-medium">
              💡 Verificando si tu video ya fue completado en segundo plano
            </p>
          )}
        </div>

        {/* Important user notice */}
        <div className="mt-8 bg-card/50 cyber-border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
            <h3 className="text-lg font-semibold text-amber-300">¡Atención!</h3>
          </div>
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">
              ⚠️ No cierres esta ventana durante el procesamiento.
            </p>
            <p className="text-muted-foreground text-sm">
              ✅ Puedes navegar a otras páginas pero mantén esta pestaña abierta.
            </p>
            <p className="text-muted-foreground text-sm">
              🔒 No cierres la sesión para evitar errores.
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            {isRecovering ? 'Verificando estado...' : 'Conexión estable - Procesamiento en curso'}
          </span>
        </div>

        {/* Pulsing indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-float delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-primary/5 rounded-full blur-lg animate-float delay-500"></div>
    </div>
  );
};

export default VideoLoadingState;
