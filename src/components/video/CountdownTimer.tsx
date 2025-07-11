
import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, Zap, Code, Activity, Brain, Wifi } from 'lucide-react';

interface CountdownTimerProps {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  startTime?: number; // Optional: timestamp when generation started
}

const CountdownTimer = ({ timeRemaining, totalTime, startTime }: CountdownTimerProps) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  
  // AI Console simulation messages
  const aiMessages = [
    "Inicializando redes neuronales...",
    "Analizando script: 47% completado",
    "Cargando modelo de IA conversacional",
    "Procesando emociones faciales...",
    "Generando sincronización labial",
    "Optimizando calidad de renderizado",
    "Aplicando filtros de mejora de video",
    "Calibrando expresiones del avatar",
    "Sincronizando audio con movimientos",
    "Renderizando frames: 1280x720p",
    "Comprimiendo archivo de salida",
    "Verificando integridad del video",
    "Aplicando corrección de color",
    "Finalizando proceso de rendering"
  ];
  
  // Force re-render when timeRemaining changes
  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);
  
  // Simulate AI working logs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogIndex(prev => (prev + 1) % aiMessages.length);
      setAiLogs(prev => {
        const newLog = aiMessages[currentLogIndex];
        const updated = [...prev, newLog];
        return updated.slice(-5); // Keep only last 5 logs
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentLogIndex, aiMessages]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const progress = ((totalTime - displayTime) / totalTime) * 100;

  return (
    <div className="relative bg-black/95 cyber-border rounded-2xl p-8 mb-8 overflow-hidden">
      {/* Matrix Scanlines Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-pulse"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-primary/30"
            style={{
              top: `${(i + 1) * 5}%`,
              animationDelay: `${i * 0.1}s`,
              animation: 'pulse 2s infinite'
            }}
          />
        ))}
      </div>

      {/* Floating Matrix Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Matrix Console Header */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Terminal className="w-6 h-6 text-primary animate-pulse" />
          <div className="font-mono text-primary text-lg tracking-wider">
            [ IA NEURAL MATRIX ]
          </div>
          <Terminal className="w-6 h-6 text-primary animate-pulse" />
        </div>

        {/* Main Timer Display */}
        <div className="relative mb-8">
          <div className="text-center">
            {/* Giant Digital Timer - FIXED LEGIBILITY */}
            <div className="relative inline-block">
              <div 
                className="text-7xl md:text-8xl font-mono font-black text-white tracking-wider"
                style={{
                  textShadow: '0 0 4px hsl(var(--primary)), 0 2px 0 #000',
                  filter: 'drop-shadow(0 0 2px hsl(var(--primary)))',
                  WebkitTextStroke: '1px hsl(var(--primary))'
                }}
                key={displayTime}
              >
                {minutes.toString().padStart(2, '0')}
                <span className="animate-pulse text-accent">:</span>
                {seconds.toString().padStart(2, '0')}
              </div>
              
              {/* Subtle Glow Background */}
              <div className="absolute inset-0 text-7xl md:text-8xl font-mono font-black text-primary/20 blur-sm -z-10">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </div>
            </div>
            
            <div className="text-primary/70 font-mono text-sm mt-2 tracking-widest">
              [ TIEMPO RESTANTE ]
            </div>
          </div>

          {/* Floating Tech Icons */}
          <div className="absolute -top-4 -right-4 animate-spin" style={{ animationDuration: '8s' }}>
            <Cpu className="w-8 h-8 text-accent opacity-60" />
          </div>
          <div className="absolute -bottom-4 -left-4 animate-bounce delay-500">
            <Zap className="w-6 h-6 text-primary opacity-80" />
          </div>
        </div>

        {/* Matrix Progress Bar */}
        <div className="space-y-4 mb-6">
          <div className="bg-black/50 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-primary text-sm">[ PROGRESO ]</div>
              <div className="font-mono text-accent text-sm">{Math.round(progress)}%</div>
            </div>
            <div className="relative h-3 bg-black/80 border border-primary/20 rounded overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 20px hsl(var(--primary))'
                }}
              />
              {/* Scanning line effect */}
              <div className="absolute top-0 left-0 h-full w-1 bg-white/80 animate-pulse" 
                   style={{ left: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* AI Process Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Code, text: "ANALIZANDO GUION", status: "ACTIVO" },
            { icon: Cpu, text: "PROCESANDO ESCENAS", status: progress > 33 ? "ACTIVO" : "ESPERA" },
            { icon: Zap, text: "RENDERIZANDO VIDEO", status: progress > 66 ? "ACTIVO" : "ESPERA" }
          ].map((item, index) => (
            <div 
              key={index}
              className={`bg-black/60 border rounded-lg p-4 transition-all duration-500 ${
                progress > (index) * 33 
                  ? 'border-primary/50 shadow-lg shadow-primary/20' 
                  : 'border-primary/20'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <item.icon className={`w-5 h-5 ${
                  progress > (index) * 33 ? 'text-primary animate-pulse' : 'text-primary/40'
                }`} />
                <div className={`font-mono text-xs tracking-wide ${
                  progress > (index) * 33 ? 'text-primary' : 'text-primary/40'
                }`}>
                  [ {item.status} ]
                </div>
              </div>
              <p className="font-mono text-xs text-primary/70">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Live AI Console */}
        <div className="bg-black/80 border border-primary/40 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <div className="font-mono text-primary text-sm">[ CONSOLA IA EN VIVO ]</div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          
          <div className="bg-black/60 border border-primary/20 rounded p-3 h-24 overflow-hidden">
            <div className="space-y-1 text-xs font-mono">
              {aiLogs.map((log, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">[IA]</span>
                  <span className="text-primary/80">{log}</span>
                  {index === aiLogs.length - 1 && (
                    <span className="animate-pulse text-primary">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fake System Resources */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/60 border border-primary/30 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs text-primary">CPU</span>
            </div>
            <div className="bg-black/40 h-2 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-accent/60 animate-pulse"
                style={{ width: `${60 + Math.sin(Date.now() / 1000) * 20}%` }}
              />
            </div>
            <div className="text-xs text-accent font-mono mt-1">
              {Math.round(60 + Math.sin(Date.now() / 1000) * 20)}%
            </div>
          </div>

          <div className="bg-black/60 border border-primary/30 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="font-mono text-xs text-primary">GPU</span>
            </div>
            <div className="bg-black/40 h-2 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 animate-pulse"
                style={{ width: `${80 + Math.cos(Date.now() / 800) * 15}%` }}
              />
            </div>
            <div className="text-xs text-green-400 font-mono mt-1">
              {Math.round(80 + Math.cos(Date.now() / 800) * 15)}%
            </div>
          </div>

          <div className="bg-black/60 border border-primary/30 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-primary">NET</span>
            </div>
            <div className="bg-black/40 h-2 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-full animate-pulse" />
            </div>
            <div className="text-xs text-primary font-mono mt-1">STABLE</div>
          </div>
        </div>

        {/* Matrix Code Stream Effect */}
        <div className="absolute top-0 right-0 w-20 h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="font-mono text-xs text-primary/40 whitespace-pre-line animate-pulse">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="leading-tight">
                {Math.random().toString(36).substring(2, 8)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
