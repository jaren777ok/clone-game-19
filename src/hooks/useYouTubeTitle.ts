
import { useState } from 'react';
import { sanitizeCaption } from '@/lib/textUtils';

export const useYouTubeTitle = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARACTERS = 98;

  const updateTitle = (newTitle: string) => {
    // Limitar a 98 caracteres
    if (newTitle.length > MAX_CHARACTERS) {
      setError(`El título no puede exceder ${MAX_CHARACTERS} caracteres`);
      return;
    }
    
    setError(null);
    setTitle(newTitle);
  };

  const sanitizeTitle = () => {
    return sanitizeCaption(title);
  };

  const isValid = title.trim().length > 0 && title.length <= MAX_CHARACTERS;
  const remainingCharacters = MAX_CHARACTERS - title.length;

  const resetTitle = () => {
    setTitle('');
    setError(null);
  };

  return {
    title,
    setTitle: updateTitle,
    sanitizeTitle,
    isValid,
    remainingCharacters,
    error,
    resetTitle,
    maxCharacters: MAX_CHARACTERS
  };
};
