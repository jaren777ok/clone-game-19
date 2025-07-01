
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share, Loader2 } from 'lucide-react';
import { SocialNetwork } from '@/hooks/useSocialPublish';

interface Props {
  selectedNetwork: SocialNetwork | null;
  onSelectNetwork: (network: SocialNetwork) => void;
  onPublish: () => void;
  isLoading?: boolean;
}

const SocialNetworkSelector: React.FC<Props> = ({
  selectedNetwork,
  onSelectNetwork,
  onPublish,
  isLoading
}) => {
  const networks = [
    {
      id: 'instagram' as SocialNetwork,
      name: 'Instagram',
      icon: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20ig.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gaWcucG5nIiwiaWF0IjoxNzUxMzQzNDM1LCJleHAiOjE3ODI4Nzk0MzV9.epi8prHz-2bejdRUE8CHb7QgvXNhw6s_qhdNe8_LT8E'
    },
    {
      id: 'tiktok' as SocialNetwork,
      name: 'TikTok',
      icon: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20tik%20tok%20(2).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gdGlrIHRvayAoMikucG5nIiwiaWF0IjoxNzUxMzQ0Njg4LCJleHAiOjE3ODI4ODA2ODh9.HP6xSt2aTW_iiNKkOqEXEPiZR2-546Mu9snsQUtlY44'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Share className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold">Red a Publicar</h2>
        <p className="text-muted-foreground">
          Selecciona la red social donde quieres publicar tu video
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {networks.map((network) => (
          <Card 
            key={network.id}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedNetwork === network.id 
                ? 'cyber-border cyber-glow ring-2 ring-primary' 
                : 'cyber-border hover:cyber-glow'
            }`}
            onClick={() => onSelectNetwork(network.id)}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto">
                <img 
                  src={network.icon} 
                  alt={`${network.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-lg">{network.name}</h3>
              <Button
                variant={selectedNetwork === network.id ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNetwork(network.id);
                }}
              >
                {selectedNetwork === network.id ? 'Seleccionado' : 'Seleccionar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedNetwork && (
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="text-lg text-center">¿Listo para publicar?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onPublish}
              disabled={isLoading}
              className="w-full cyber-glow"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando... (máximo 7 minutos)
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialNetworkSelector;
