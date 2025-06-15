
import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
}

const CountdownTimer = ({ timeRemaining, totalTime }: CountdownTimerProps) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="bg-card cyber-border rounded-2xl p-8 mb-8 hover:cyber-glow transition-all duration-500">
      <div className="text-center space-y-6">
        {/* Timer Display */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto relative">
            {/* Background Circle */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-muted-foreground">minutos</div>
              </div>
            </div>
          </div>

          {/* Floating Sparkles */}
          <div className="absolute -top-2 -right-2 animate-bounce delay-100">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">
              Procesamiento en Curso
            </h3>
          </div>
          
          <p className="text-muted-foreground">
            Tu video se está generando. El sistema verificará automáticamente cuando esté listo.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              ⚡ El proceso puede completarse antes del tiempo estimado
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Iniciado</span>
            <span>{Math.round(progress)}%</span>
            <span>Completado</span>
          </div>
        </div>

        {/* Motivational Messages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: "🎬", text: "Analizando tu guion" },
            { icon: "🎨", text: "Generando escenas" },
            { icon: "✨", text: "Finalizando video" }
          ].map((item, index) => (
            <div 
              key={index}
              className={`bg-card/50 cyber-border rounded-lg p-3 transition-all duration-500 ${
                progress > (index + 1) * 33 ? 'cyber-glow opacity-100' : 'opacity-50'
              }`}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <p className="text-xs text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
