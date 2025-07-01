
import React from 'react';
import { Bot, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CaptionGeneratorStepProps {
  onCaptionGenerated: () => void;
  onGenerateCaption: (script: string) => Promise<{ success: boolean; caption?: string; error?: string }>;
  videoScript: string;
  generatedCaption: string;
  editedCaption: string;
  onUpdateCaption: (caption: string) => void;
  isGenerating: boolean;
  error: string | null;
}

const CaptionGeneratorStep = ({ 
  onCaptionGenerated,
  onGenerateCaption,
  videoScript,
  generatedCaption,
  editedCaption,
  onUpdateCaption,
  isGenerating,
  error
}: CaptionGeneratorStepProps) => {
  const handleGenerate = async () => {
    const result = await onGenerateCaption(videoScript);
    // El resultado se maneja en el hook, aquí no necesitamos hacer nada adicional
  };

  const handleUseCaption = () => {
    if (editedCaption.trim()) {
      onCaptionGenerated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <Bot className="w-8 h-8 text-background" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Generar Caption IA</h3>
        <p className="text-muted-foreground">
          Usa inteligencia artificial para crear un caption atractivo para tu video
        </p>
      </div>

      {/* Información del script */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Script del video:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {videoScript.length > 200 ? `${videoScript.substring(0, 200)}...` : videoScript}
        </p>
      </div>

      {/* Botón de generar o área de caption */}
      {!generatedCaption && !isGenerating && (
        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="cyber-border hover:cyber-glow-intense"
            size="lg"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Generar
          </Button>
        </div>
      )}

      {/* Estado de carga */}
      {isGenerating && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h4 className="font-medium mb-2">Generando caption con IA...</h4>
          <p className="text-sm text-muted-foreground">
            Esto puede tomar hasta 5 minutos. Por favor espera.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
          <Button
            onClick={handleGenerate}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Caption generado */}
      {generatedCaption && !isGenerating && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="caption">Caption generado (puedes editarlo):</Label>
            <Textarea
              id="caption"
              value={editedCaption}
              onChange={(e) => onUpdateCaption(e.target.value)}
              placeholder="Tu caption aparecerá aquí..."
              className="min-h-[120px] cyber-border focus:cyber-glow mt-2"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleGenerate}
              className="cyber-border hover:cyber-glow"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generar Nuevo
            </Button>

            <Button
              onClick={handleUseCaption}
              disabled={!editedCaption.trim()}
              className="cyber-border hover:cyber-glow-intense"
            >
              Usar este Caption
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptionGeneratorStep;
