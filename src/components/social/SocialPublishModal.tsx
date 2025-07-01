
import React, { useState, useEffect } from 'react';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlotatoAccounts } from '@/hooks/useBlotatoAccounts';
import BlotatoApiKeyStep from './BlotatoApiKeyStep';
import SocialAccountsStep from './SocialAccountsStep';
import StepIndicator from './StepIndicator';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [initialStepDetermined, setInitialStepDetermined] = useState(false);
  const { blotatoAccount, loading, saveBlotatoApiKey, updateSocialAccounts } = useBlotatoAccounts();

  const stepLabels = ['API Key', 'Cuentas Sociales'];

  // Determinar el paso inicial basado en la configuración existente
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('🔄 Modal opened, determining initial step...');
    console.log('📊 Current state:', { loading, blotatoAccount, initialStepDetermined });
    
    if (!loading && !initialStepDetermined) {
      console.log('🎯 Determining initial step...');
      
      if (!blotatoAccount) {
        console.log('➡️ No Blotato account found, starting at step 1 (API Key)');
        setCurrentStep(1);
      } else if (blotatoAccount.api_key_encrypted && 
                 !blotatoAccount.instagram_account_id && 
                 !blotatoAccount.tiktok_account_id) {
        console.log('➡️ API key exists but no social accounts, going to step 2 (Social Accounts)');
        setCurrentStep(2);
      } else if (blotatoAccount.api_key_encrypted && 
                 (blotatoAccount.instagram_account_id || blotatoAccount.tiktok_account_id)) {
        console.log('➡️ Full configuration exists, going to step 3 (Complete)');
        setCurrentStep(3);
      } else {
        console.log('➡️ Partial configuration found, starting at step 1');
        setCurrentStep(1);
      }
      
      setInitialStepDetermined(true);
    }
  }, [isOpen, loading, blotatoAccount, initialStepDetermined]);

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      console.log('🔄 Modal closed, resetting state...');
      setInitialStepDetermined(false);
      // No reseteamos currentStep aquí - se determinará cuando se abra de nuevo
    }
  }, [isOpen]);

  const handleApiKeySaved = () => {
    console.log('✅ API key saved, moving to step 2');
    setCurrentStep(2);
  };

  const handleAccountsSaved = () => {
    console.log('✅ Accounts saved, moving to step 3');
    setCurrentStep(3);
  };

  const handleClose = () => {
    console.log('🚪 Closing modal...');
    onClose();
  };

  if (!isOpen) return null;

  // Mostrar loading mientras se determina el paso inicial
  if (loading || !initialStepDetermined) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl cyber-border">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium mb-2">Verificando configuración...</h3>
              <p className="text-muted-foreground text-sm">
                Revisando tu configuración de Blotato existente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto cyber-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center">
            <Share2 className="w-6 h-6 mr-3 text-primary" />
            <CardTitle className="text-xl">Publicar en Redes Sociales</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Indicador de pasos */}
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={2} 
            stepLabels={stepLabels}
          />

          {/* Video Preview */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Video a compartir:</h4>
            <p className="text-sm text-muted-foreground mb-2">{videoTitle}</p>
            <p className="text-xs text-muted-foreground font-mono break-all">{videoUrl}</p>
          </div>

          {/* Pasos del proceso */}
          {currentStep === 1 && (
            <BlotatoApiKeyStep
              onApiKeySaved={handleApiKeySaved}
              onSaveApiKey={saveBlotatoApiKey}
              isLoading={loading}
            />
          )}

          {currentStep === 2 && (
            <SocialAccountsStep
              onAccountsSaved={handleAccountsSaved}
              onSaveAccounts={updateSocialAccounts}
              existingInstagramId={blotatoAccount?.instagram_account_id}
              existingTiktokId={blotatoAccount?.tiktok_account_id}
              isLoading={loading}
            />
          )}

          {currentStep === 3 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
                <Share2 className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">¡Configuración Completa!</h3>
              <p className="text-muted-foreground mb-6">
                Tu cuenta de Blotato está configurada correctamente.<br/>
                Próximamente podrás publicar directamente desde aquí.
              </p>
              <div className="bg-muted/20 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-2">Configuración actual:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>✅ API Key de Blotato configurada</div>
                  {blotatoAccount?.instagram_account_id && (
                    <div>✅ Instagram: {blotatoAccount.instagram_account_id}</div>
                  )}
                  {blotatoAccount?.tiktok_account_id && (
                    <div>✅ TikTok: {blotatoAccount.tiktok_account_id}</div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleClose}
                className="cyber-border hover:cyber-glow-intense"
              >
                Cerrar
              </Button>
            </div>
          )}

          {/* Botones de navegación para pasos 1 y 2 */}
          {currentStep < 3 && (
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? handleClose : () => setCurrentStep(currentStep - 1)}
                className="cyber-border hover:cyber-glow"
              >
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </Button>
              
              <div className="text-sm text-muted-foreground flex items-center">
                Paso {currentStep} de {stepLabels.length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPublishModal;
