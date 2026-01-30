
import React from 'react';
import { Key, User, Mic, Palette, Type, Settings, Video } from 'lucide-react';
import { FlowState } from '@/types/videoFlow';

interface GeneratorConfigSummaryProps {
  flowState: FlowState;
}

const GeneratorConfigSummary = ({ flowState }: GeneratorConfigSummaryProps) => {
  return (
    <div className="space-y-4">
      {/* Header del Panel */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mb-4">
          <Video className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          CloneGame
        </h2>
        <p className="text-sm text-muted-foreground">Generador de Videos IA</p>
      </div>

      {/* Separador */}
      <div className="border-t border-border/30 my-4" />

      {/* Título del Resumen */}
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Resumen de Configuración
      </h3>

      {/* API Key */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">API Key</p>
            <p className="font-medium truncate">{flowState.selectedApiKey?.api_key_name || 'No seleccionada'}</p>
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Avatar</p>
            <p className="font-medium truncate">{flowState.selectedAvatar?.avatar_name || 'No seleccionado'}</p>
          </div>
        </div>
      </div>

      {/* Voz */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Voz</p>
            <p className="font-medium truncate">{flowState.selectedVoice?.voice_name || 'No seleccionada'}</p>
          </div>
        </div>
      </div>

      {/* Estilo */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Estilo</p>
            <p className="font-medium truncate">{flowState.selectedStyle?.name || 'No seleccionado'}</p>
          </div>
        </div>
      </div>

      {/* Subtítulos */}
      <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Type className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Subtítulos</p>
            <p className="font-medium truncate">
              {flowState.subtitleCustomization?.fontFamily || 'Por defecto'}
              {flowState.subtitleCustomization?.placementEffect && 
                `, ${flowState.subtitleCustomization.placementEffect}`}
            </p>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-border/30 my-4" />

      {/* Indicador de configuración completa */}
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium">Configuración Completa</span>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default GeneratorConfigSummary;
