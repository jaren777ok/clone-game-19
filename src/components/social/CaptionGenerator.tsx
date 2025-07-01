
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  script: string;
  generatedCaption: string;
  editedCaption: string;
  onGenerate: () => void;
  onCaptionChange: (caption: string) => void;
  onNext: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const CaptionGenerator: React.FC<Props> = ({
  script,
  generatedCaption,
  editedCaption,
  onGenerate,
  onCaptionChange,
  onNext,
  isLoading,
  error
}) => {
  const hasGenerated = !!generatedCaption;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold">Genera Caption IA</h2>
        <p className="text-muted-foreground">
          Genera un caption optimizado para redes sociales usando inteligencia artificial
        </p>
      </div>

      {!hasGenerated && (
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="text-lg">Script del Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {script}
              </p>
            </div>
            
            <div className="mt-4">
              <Button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full cyber-glow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando caption... (máximo 5 minutos)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasGenerated && (
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="text-lg">Caption Generado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Edita tu caption:</label>
              <Textarea
                value={editedCaption}
                onChange={(e) => onCaptionChange(e.target.value)}
                placeholder="Tu caption aparecerá aquí..."
                className="min-h-32 cyber-border"
              />
            </div>

            <Button
              onClick={onNext}
              disabled={!editedCaption.trim()}
              className="w-full cyber-glow"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default CaptionGenerator;
