
import React from 'react';
import { Send, Clock, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ScriptFormProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  error: string | null;
}

const ScriptForm = ({ script, setScript, onSubmit, isGenerating, error }: ScriptFormProps) => {
  return (
    <div className="bg-card cyber-border rounded-2xl p-8 hover:cyber-glow transition-all duration-500 mb-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="script" className="block text-lg font-semibold text-foreground mb-3">
            Ingresa tu enlace de Noticia y Opcional alguna indicación
          </label>
          <Textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Pega aquí el enlace de la noticia y opcionalmente agrega indicaciones sobre cómo quieres el guion..."
            className="min-h-[200px] text-base cyber-border focus:cyber-glow resize-none"
            maxLength={1400}
          />
          <div className="flex justify-end items-center mt-2">
            <span className="text-sm text-muted-foreground">
              {script.length}/1400
            </span>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">
                Tiempo de procesamiento extendido
              </p>
              <p className="text-muted-foreground text-sm">
                La generación puede tomar hasta 2 horas. El sistema monitorea automáticamente 
                el progreso y te notificará cuando esté listo.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Wifi className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 text-sm font-medium mb-1">
                Sistema de monitoreo inteligente
              </p>
              <p className="text-muted-foreground text-sm">
                Conexión estable de larga duración con sistema de monitoreo automático 
                para garantizar que tu video se procese correctamente.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!script.trim() || isGenerating}
          size="lg"
          className="w-full cyber-border hover:cyber-glow-intense transition-all duration-300"
        >
          <Send className="w-5 h-5 mr-2" />
          Generar Video
        </Button>
      </div>
    </div>
  );
};

export default ScriptForm;
