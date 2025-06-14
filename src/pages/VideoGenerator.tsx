
import React from 'react';
import VideoLoadingState from '@/components/video/VideoLoadingState';
import VideoResult from '@/components/video/VideoResult';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import VideoGeneratorHeader from '@/components/video/VideoGeneratorHeader';
import RecoveryNotification from '@/components/video/RecoveryNotification';
import ScriptForm from '@/components/video/ScriptForm';
import TipsSection from '@/components/video/TipsSection';

const VideoGenerator = () => {
  const { state, handlers } = useVideoGenerator();

  if (state.isGenerating) {
    return (
      <VideoLoadingState 
        elapsedTime={state.elapsedTime}
        isRecovering={state.isRecovering}
      />
    );
  }

  if (state.videoResult) {
    return (
      <VideoResult 
        videoUrl={state.videoResult} 
        onNewVideo={handlers.handleNewVideo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <VideoGeneratorHeader />

        {state.showRecoveryOption && (
          <RecoveryNotification 
            onRecover={handlers.handleRecoverGeneration}
            onCancel={handlers.handleCancelRecovery}
          />
        )}

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              Generador de Videos IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Convierte tu guion en un video profesional con inteligencia artificial
            </p>
          </div>

          <ScriptForm 
            script={state.script}
            setScript={handlers.setScript}
            onSubmit={handlers.handleGenerateVideo}
            isGenerating={state.isGenerating}
            error={state.error}
          />

          <TipsSection />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGenerator;
