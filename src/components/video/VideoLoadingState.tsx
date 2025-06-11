
import React from 'react';
import { Loader2, Video, Sparkles } from 'lucide-react';

const VideoLoadingState = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Main loading animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-6 animate-cyber-pulse">
            <Video className="w-16 h-16 text-background" />
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
          Generando tu Video
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          Nuestra IA está procesando tu guion y creando un video único para ti
        </p>

        {/* Progress indicator */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-foreground font-medium">Procesando...</span>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Steps animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step: 1, title: "Analizando Guion", icon: "📝", active: true },
            { step: 2, title: "Generando Escenas", icon: "🎬", active: true },
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

        {/* Motivational messages */}
        <div className="mt-12 space-y-3">
          <p className="text-muted-foreground text-sm">
            ⚡ Esto puede tomar unos minutos dependiendo de la complejidad
          </p>
          <p className="text-muted-foreground text-sm">
            🎯 Cuanto más detallado sea tu guion, mejor será el resultado
          </p>
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
