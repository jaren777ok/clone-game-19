
import React from 'react';
import { Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useYouTubeTitle } from '@/hooks/useYouTubeTitle';

interface YouTubeTitleStepProps {
  onTitleConfirmed: (title: string) => void;
  onBack: () => void;
}

const YouTubeTitleStep = ({ onTitleConfirmed, onBack }: YouTubeTitleStepProps) => {
  const { 
    title, 
    setTitle, 
    sanitizeTitle, 
    isValid, 
    remainingCharacters, 
    error, 
    maxCharacters 
  } = useYouTubeTitle();

  const handleConfirm = () => {
    if (isValid) {
      const sanitizedTitle = sanitizeTitle();
      onTitleConfirmed(sanitizedTitle);
    }
  };

  const getCharacterCountColor = () => {
    if (remainingCharacters < 10) return 'text-red-500';
    if (remainingCharacters < 30) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Título para YouTube</h3>
        <p className="text-muted-foreground">
          Ingresa un título llamativo para tu video de YouTube
        </p>
      </div>

      {/* Title Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="youtube-title" className="text-sm font-medium">
            Título del video
          </label>
          <Input
            id="youtube-title"
            type="text"
            placeholder="Ej: Mi increíble video de IA generativa..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="cyber-border focus:cyber-glow text-base"
            maxLength={maxCharacters}
          />
          
          {/* Character Counter */}
          <div className="flex justify-between items-center text-sm">
            <span className={getCharacterCountColor()}>
              {title.length}/{maxCharacters} caracteres
            </span>
            {remainingCharacters <= 10 && remainingCharacters > 0 && (
              <span className="text-yellow-500">
                {remainingCharacters} caracteres restantes
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-muted/20 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Tips para un buen título:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sé descriptivo y llamativo</li>
            <li>• Incluye palabras clave relevantes</li>
            <li>• Evita MAYÚSCULAS excesivas</li>
            <li>• Máximo {maxCharacters} caracteres</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="cyber-border hover:cyber-glow"
        >
          Atrás
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={!isValid}
          className="cyber-border hover:cyber-glow-intense bg-gradient-to-r from-red-500 to-red-600 text-white"
        >
          Continuar con Publicación
        </Button>
      </div>
    </div>
  );
};

export default YouTubeTitleStep;
