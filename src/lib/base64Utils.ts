import { Base64File } from '@/types/videoFlow';

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert base64 string back to File object
 */
export const base64ToFile = (base64: string, name: string, type: string): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type });
  
  return new File([blob], name, { type, lastModified: Date.now() });
};

/**
 * Convert Base64File back to File object for display/preview
 */
export const base64FileToFile = (base64File: Base64File): File => {
  return base64ToFile(base64File.data, base64File.name, base64File.type);
};

/**
 * Convert array of Base64Files back to File objects
 */
export const base64FilesToFiles = (base64Files: Base64File[]): File[] => {
  return base64Files.map(base64FileToFile);
};

/**
 * Get total size of Base64Files in bytes
 */
export const getTotalBase64Size = (base64Files: Base64File[]): number => {
  return base64Files.reduce((total, file) => total + file.size, 0);
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};