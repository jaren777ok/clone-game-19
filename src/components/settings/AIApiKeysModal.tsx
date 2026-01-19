import React, { useState, useEffect } from 'react';
import { Key, Brain, Sparkles, Save, X, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AIApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIApiKeysModal: React.FC<AIApiKeysModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [formData, setFormData] = useState({
    openai_api_key: '',
    gemini_api_key: ''
  });

  // Cargar claves existentes al abrir el modal
  useEffect(() => {
    if (open && user) {
      loadExistingKeys();
    }
  }, [open, user]);

  const loadExistingKeys = async () => {
    if (!user) return;
    
    setLoadingKeys(true);
    try {
      const { data, error } = await supabase
        .from('user_ai_api_keys')
        .select('openai_api_key, gemini_api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading AI API keys:', error);
        return;
      }
      
      if (data) {
        setFormData({
          openai_api_key: data.openai_api_key || '',
          gemini_api_key: data.gemini_api_key || ''
        });
      }
    } catch (error) {
      console.error('Error loading AI API keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar tus claves API",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_ai_api_keys')
        .upsert({
          user_id: user.id,
          openai_api_key: formData.openai_api_key.trim(),
          gemini_api_key: formData.gemini_api_key.trim(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (error) {
        console.error('Error saving AI API keys:', error);
        toast({
          title: "Error al guardar",
          description: "No se pudieron guardar las claves API. Intenta de nuevo.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Claves API guardadas",
        description: "Tus claves de OpenAI y Gemini han sido guardadas correctamente"
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving AI API keys:', error);
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md cyber-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="w-5 h-5 text-primary" />
            Conectar APIs de IA
          </DialogTitle>
          <DialogDescription>
            Ingresa tus claves API para habilitar las funciones avanzadas de IA
          </DialogDescription>
        </DialogHeader>

        {loadingKeys ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* OpenAI API Key */}
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-green-500" />
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAI ? "text" : "password"}
                  placeholder="sk-..."
                  value={formData.openai_api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, openai_api_key: e.target.value }))}
                  className="pr-10 cyber-border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowOpenAI(!showOpenAI)}
                >
                  {showOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtén tu clave en{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGemini ? "text" : "password"}
                  placeholder="AIza..."
                  value={formData.gemini_api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, gemini_api_key: e.target.value }))}
                  className="pr-10 cyber-border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowGemini(!showGemini)}
                >
                  {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtén tu clave en{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  aistudio.google.com
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 cyber-glow"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIApiKeysModal;
