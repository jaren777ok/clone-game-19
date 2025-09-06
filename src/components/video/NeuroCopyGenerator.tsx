
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { generateScript } from '@/lib/neurocopyUtils';

interface Props {
  onBack: () => void;
  onUseScript: (script: string) => void;
}

const NeuroCopyGenerator: React.FC<Props> = ({ onBack, onUseScript }) => {
  const [instructions, setInstructions] = useState('');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { sessionId } = useSession();

  const handleGenerateScript = async () => {
    if (!instructions.trim()) {
      toast({
        title: "Instrucciones requeridas",
        description: "Por favor, ingresa instrucciones para generar tu guión.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generando script con SessionID:', sessionId);
      const script = await generateScript(instructions, user?.id);
      setGeneratedScript(script);
      
      toast({
        title: "¡Guión generado!",
        description: "Tu guión ha sido creado exitosamente.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error al generar guión",
        description: "No se pudo generar el guión. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseThisScript = () => {
    if (generatedScript) {
      onUseScript(generatedScript);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a estilos
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-safe leading-normal py-4 animate-glow-text">
              NeuroCopy GPT
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Inteligencia artificial híbrida para copywriting avanzado
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              Describe lo que necesitas para tu video e ingresa enlaces de referencia si los tienes
            </p>
            <p className="text-xs text-muted-foreground/80">
              💡 Potencia tu copywriting: Usa videos de la competencia y hazlo aún más viral!
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground/60 mt-2">
                Sesión: {sessionId.substring(0, 40)}...
              </p>
            )}
          </div>

          <Card className="cyber-border mb-6">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium mb-3">
                    Instrucciones para tu guión
                  </label>
                  <textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Describe tu idea de contenido e Incluye enlaces de videos de Instagram, TikTok o Noticias para hacer tu guion"
                    className="w-full h-32 p-4 border rounded-lg bg-background/50 backdrop-blur-sm cyber-border focus:cyber-glow resize-none"
                    disabled={isGenerating}
                  />
                </div>
                
                <Button
                  onClick={handleGenerateScript}
                  disabled={isGenerating || !instructions.trim()}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 cyber-glow text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generando guión...
                    </>
                  ) : generatedScript ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Generar Otro Guión
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generar Guión con IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedScript && (
            <div className="space-y-6">
              <Card className="cyber-border cyber-glow-intense">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Tu guión generado</h3>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-6 border cyber-border">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedScript}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleUseThisScript}
                className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 cyber-glow text-xl font-semibold"
              >
                <Check className="w-6 h-6 mr-3" />
                Usar este Guión
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default NeuroCopyGenerator;
