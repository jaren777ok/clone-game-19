
import React, { useState } from 'react';
import { X, Share2, Twitter, Facebook, Instagram, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  videoScript: string;
}

const SocialPublishModal = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  videoTitle, 
  videoScript 
}: SocialPublishModalProps) => {
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const socialNetworks = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  ];

  const handleNetworkToggle = (networkId: string) => {
    setSelectedNetworks(prev => 
      prev.includes(networkId) 
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    );
  };

  const handlePublish = async () => {
    if (selectedNetworks.length === 0) {
      toast({
        title: "Selecciona una red social",
        description: "Debes seleccionar al menos una red social para publicar.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    
    // Simular publicación (aquí irían las APIs reales de cada red social)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "¡Publicado exitosamente!",
        description: `Tu video ha sido compartido en ${selectedNetworks.length} red${selectedNetworks.length > 1 ? 'es' : ''} social${selectedNetworks.length > 1 ? 'es' : ''}.`,
      });
      
      onClose();
      setSelectedNetworks([]);
      setCustomMessage('');
    } catch (error) {
      toast({
        title: "Error al publicar",
        description: "Hubo un problema al compartir tu video. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const generateDefaultMessage = () => {
    return `¡Mira este increíble video que creé con IA! 🚀\n\n"${videoTitle}"\n\n${videoUrl}\n\n#VideoIA #TecnologíaCreativa`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto cyber-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center">
            <Share2 className="w-6 h-6 mr-3 text-primary" />
            <CardTitle className="text-xl">Publicar en Redes Sociales</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Video a compartir:</h4>
            <p className="text-sm text-muted-foreground mb-2">{videoTitle}</p>
            <p className="text-xs text-muted-foreground font-mono break-all">{videoUrl}</p>
          </div>

          {/* Social Networks Selection */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Selecciona las redes sociales:</h4>
            <div className="grid grid-cols-2 gap-3">
              {socialNetworks.map((network) => {
                const IconComponent = network.icon;
                const isSelected = selectedNetworks.includes(network.id);
                
                return (
                  <Button
                    key={network.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`p-4 h-auto justify-start cyber-border ${
                      isSelected ? 'cyber-glow' : 'hover:cyber-glow'
                    }`}
                    onClick={() => handleNetworkToggle(network.id)}
                  >
                    <IconComponent className={`w-5 h-5 mr-3 ${network.color}`} />
                    {network.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Mensaje personalizado:</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomMessage(generateDefaultMessage())}
                className="text-xs"
              >
                Generar mensaje
              </Button>
            </div>
            <Textarea
              placeholder="Escribe un mensaje personalizado para acompañar tu video..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="cyber-border focus:cyber-glow min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {customMessage.length}/280 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="cyber-border hover:cyber-glow"
              disabled={isPublishing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing || selectedNetworks.length === 0}
              className="cyber-border hover:cyber-glow-intense"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar en {selectedNetworks.length} red{selectedNetworks.length !== 1 ? 'es' : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPublishModal;
