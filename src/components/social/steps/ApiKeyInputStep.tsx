
import React from 'react';
import BlotatomApiKeyForm from '../BlotatomApiKeyForm';

interface Props {
  onApiKeySaved: (name: string, apiKey: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ApiKeyInputStep: React.FC<Props> = ({ onApiKeySaved, isLoading, error }) => {
  return (
    <BlotatomApiKeyForm
      onSave={onApiKeySaved}
      isLoading={isLoading}
      error={error}
      hasExistingKeys={false}
    />
  );
};

export default ApiKeyInputStep;
