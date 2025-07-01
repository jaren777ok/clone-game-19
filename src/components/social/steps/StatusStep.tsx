
import React from 'react';
import PublishStatus from '../PublishStatus';

interface Props {
  isSuccess: boolean;
  error?: string | null;
  onRetry: () => void;
  onClose: () => void;
}

const StatusStep: React.FC<Props> = ({ isSuccess, error, onRetry, onClose }) => {
  return (
    <PublishStatus
      isSuccess={isSuccess}
      error={error}
      onRetry={onRetry}
      onClose={onClose}
    />
  );
};

export default StatusStep;
