import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBlotatoAccounts } from '@/hooks/useBlotatoAccounts';
import { useCaptionGenerator } from '@/hooks/useCaptionGenerator';
import { useSocialPublisher } from '@/hooks/useSocialPublisher';
import BlotatoApiKeyStep from './BlotatoApiKeyStep';
import SocialAccountsStep from './SocialAccountsStep';
import CaptionGeneratorStep from './CaptionGeneratorStep';
import SocialNetworkSelector from './SocialNetworkSelector';
import YouTubeTitleStep from './YouTubeTitleStep';
import ModalHeader from './ModalHeader';
import StepNavigation from './StepNavigation';
import LoadingState from './LoadingState';
import ModalCloseButton from './ModalCloseButton';

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
  const [youtubeTitle, setYoutubeTitle] = useState<string>('');
  const [needsYouTubeTitle, setNeedsYouTubeTitle] = useState(false);
  const { blotatoAccount, loading, saveBlotatoApiKey, updateSocialAccounts } = useBlotatoAccounts();
  
  // Caption generator hook
  const {
    generatedCaption,
    editedCaption,
    isGenerating,
    error: captionError,
    generateCaption,
    updateCaption,
    resetCaption
  } = useCaptionGenerator();

  // Social publisher hook
  const {
    publishingToInstagram,
    publishingToTikTok,
    publishingToYouTube,
    publishingToFacebook,
    publishSuccess,
    publishError,
    publishToSocialNetwork,
    resetPublishState
  } = useSocialPublisher();

  const stepLabels = ['API Key', 'Cuentas Sociales', 'Caption IA', 'Título YouTube', 'Publicar'];

  // Determinar el paso inicial basado en la configuración existente
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('🔄 Modal opened, determining initial step...');
    console.log('📊 Current state:', { loading, blotatoAccount, initialStepDetermined });
    
    if (!loading && !initialStepDetermined) {
      console.log('🎯 Determining initial step...');
      
      if (!blotatoAccount?.api_key_encrypted) {
        console.log('➡️ No API key found, starting at step 1');
        setCurrentStep(1);
      } else if (!blotatoAccount.instagram_account_id && !blotatoAccount.tiktok_account_id && !blotatoAccount.youtube_account_id && !blotatoAccount.facebook_account_id) {
        console.log('➡️ API key exists but no social accounts, going to step 2');
        setCurrentStep(2);
      } else if (!generatedCaption && !editedCaption) {
        console.log('➡️ Configuration exists but no caption, going to step 3');
        setCurrentStep(3);
      } else {
        console.log('➡️ Full configuration exists, going to step 5 (skip YouTube title)');
        setCurrentStep(5);
      }
      
      setInitialStepDetermined(true);
    }
  }, [isOpen, loading, blotatoAccount, initialStepDetermined, generatedCaption, editedCaption]);

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      console.log('🔄 Modal closed, resetting state...');
      setInitialStepDetermined(false);
      setYoutubeTitle('');
      setNeedsYouTubeTitle(false);
      resetCaption();
      resetPublishState();
    }
  }, [isOpen, resetCaption, resetPublishState]);

  const handleApiKeySaved = () => {
    console.log('✅ API key saved, moving to step 2');
    setCurrentStep(2);
  };

  const handleAccountsSaved = () => {
    console.log('✅ Accounts saved, moving to step 3');
    setCurrentStep(3);
  };

  const handleCaptionGenerated = () => {
    console.log('✅ Caption generated, moving to step 5');
    setCurrentStep(5);
  };

  const handleYouTubeSelected = () => {
    console.log('🎬 YouTube selected, moving to title step');
    setNeedsYouTubeTitle(true);
    setCurrentStep(4);
  };

  const handleYouTubeTitleConfirmed = (title: string) => {
    console.log('✅ YouTube title confirmed:', title);
    setYoutubeTitle(title);
    setCurrentStep(5);
  };

  const handlePublish = async (platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook', videoUrl: string, apiKey: string, accountId: string, caption: string, pageId?: string) => {
    // Para YouTube, incluir el título si está disponible
    const payload: any = {
      videoUrl,
      platform,
      apiKey,
      accountId,
      caption
    };

    if (platform === 'YouTube' && youtubeTitle) {
      payload.titulo = youtubeTitle;
    }

    if (platform === 'Facebook' && pageId) {
      payload.pageId = pageId;
    }

    return await publishToSocialNetwork(payload);
  };

  const handleClose = () => {
    console.log('🚪 Closing modal...');
    onClose();
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  // Mostrar loading mientras se determina el paso inicial
  if (loading || !initialStepDetermined) {
    return <LoadingState />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto cyber-border">
        <ModalHeader onClose={handleClose} />
        
        <CardContent className="space-y-6">
          {/* Indicador de pasos */}
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={5} 
            stepLabels={stepLabels}
          />

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
              existingYoutubeId={blotatoAccount?.youtube_account_id}
              existingFacebookId={blotatoAccount?.facebook_account_id}
              existingFacebookPageId={blotatoAccount?.facebook_page_id}
              isLoading={loading}
            />
          )}

          {currentStep === 3 && (
            <CaptionGeneratorStep
              onCaptionGenerated={handleCaptionGenerated}
              onGenerateCaption={generateCaption}
              videoScript={videoScript}
              generatedCaption={generatedCaption}
              editedCaption={editedCaption}
              onUpdateCaption={updateCaption}
              isGenerating={isGenerating}
              error={captionError}
            />
          )}

          {currentStep === 4 && (
            <YouTubeTitleStep
              onTitleConfirmed={handleYouTubeTitleConfirmed}
              onBack={() => setCurrentStep(5)}
            />
          )}

          {currentStep === 5 && blotatoAccount && (
            <SocialNetworkSelector
              onPublish={handlePublish}
              onYouTubeSelected={handleYouTubeSelected}
              videoUrl={videoUrl}
              caption={editedCaption || generatedCaption}
              blotatoApiKey={blotatoAccount.api_key_encrypted}
              instagramAccountId={blotatoAccount.instagram_account_id}
              tiktokAccountId={blotatoAccount.tiktok_account_id}
              youtubeAccountId={blotatoAccount.youtube_account_id}
              facebookAccountId={blotatoAccount.facebook_account_id}
              facebookPageId={blotatoAccount.facebook_page_id}
              publishingToInstagram={publishingToInstagram}
              publishingToTikTok={publishingToTikTok}
              publishingToYouTube={publishingToYouTube}
              publishingToFacebook={publishingToFacebook}
              publishSuccess={publishSuccess}
              publishError={publishError}
              youtubeTitle={youtubeTitle}
            />
          )}

          {/* Botones de navegación para pasos 1, 2 y 3 */}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={5}
            onPrevious={handlePrevious}
            onClose={handleClose}
            showNavigation={currentStep < 4}
          />

          {/* Botón para cerrar en el paso final */}
          {currentStep === 5 && (
            <ModalCloseButton onClose={handleClose} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPublishModal;
