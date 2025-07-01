
import React from 'react';
import CaptionGenerator from '../CaptionGenerator';

interface Props {
  script: string;
  generatedCaption: string;
  editedCaption: string;
  onGenerate: () => void;
  onCaptionChange: (caption: string) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

const CaptionGenerationStep: React.FC<Props> = ({
  script,
  generatedCaption,
  editedCaption,
  onGenerate,
  onCaptionChange,
  onNext,
  isLoading,
  error
}) => {
  return (
    <CaptionGenerator
      script={script}
      generatedCaption={generatedCaption}
      editedCaption={editedCaption}
      onGenerate={onGenerate}
      onCaptionChange={onCaptionChange}
      onNext={onNext}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default CaptionGenerationStep;
