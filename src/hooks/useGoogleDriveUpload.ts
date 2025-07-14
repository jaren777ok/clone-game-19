import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DriveUploadResult {
  success: boolean;
  imageUrls: string[];
  videoUrls: string[];
  error?: string;
}

export const useGoogleDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const uploadToGoogleDrive = async (
    images: File[],
    videos: File[],
    accessToken: string,
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<DriveUploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('accessToken', accessToken);
      
      // Add images with proper naming
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      
      // Add videos with proper naming
      videos.forEach((video, index) => {
        formData.append(`video${index + 1}`, video);
      });

      const totalFiles = images.length + videos.length;
      
      if (onProgress) {
        onProgress(0, totalFiles, 'Preparando archivos...');
      }

      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload files to Google Drive');
      }

      setUploadProgress(100);
      if (onProgress) {
        onProgress(totalFiles, totalFiles, '¡Subida completada!');
      }

      return {
        success: true,
        imageUrls: data.imageUrls || [],
        videoUrls: data.videoUrls || [],
      };

    } catch (error) {
      console.error('Google Drive upload error:', error);
      return {
        success: false,
        imageUrls: [],
        videoUrls: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToGoogleDrive,
    isUploading,
    uploadProgress,
    currentFile,
  };
};