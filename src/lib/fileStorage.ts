// Utilities for temporary local file storage during video creation flow

export interface SerializableFile {
  name: string;
  size: number;
  type: string;
  data: string; // base64
  lastModified: number;
}

export interface LocalFileStorage {
  sessionId: string;
  images: SerializableFile[];
  videos: SerializableFile[];
  timestamp: number;
}

const STORAGE_KEY = 'manual_upload_files';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for localStorage

// Convert File to base64 string
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

// Convert base64 back to File
export const base64ToFile = (base64: string, name: string, type: string, lastModified: number): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type });
  
  // Create File with proper lastModified
  const file = new File([blob], name, { type, lastModified });
  return file;
};

// Save files to localStorage
export const saveFilesToLocal = async (images: File[], videos: File[]): Promise<string> => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Check total size
    const totalSize = [...images, ...videos].reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE) {
      throw new Error('Total file size exceeds localStorage limit');
    }

    // Convert files to serializable format
    const serializedImages: SerializableFile[] = await Promise.all(
      images.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: await fileToBase64(file)
      }))
    );

    const serializedVideos: SerializableFile[] = await Promise.all(
      videos.map(async (file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: await fileToBase64(file)
      }))
    );

    const storage: LocalFileStorage = {
      sessionId,
      images: serializedImages,
      videos: serializedVideos,
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    console.log('✅ Files saved to localStorage with sessionId:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('❌ Error saving files to localStorage:', error);
    throw error;
  }
};

// Load files from localStorage
export const loadFilesFromLocal = (sessionId?: string): { images: File[]; videos: File[] } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('📭 No files found in localStorage');
      return null;
    }

    const storage: LocalFileStorage = JSON.parse(stored);
    
    // If sessionId provided, verify it matches
    if (sessionId && storage.sessionId !== sessionId) {
      console.log('❌ SessionId mismatch in localStorage');
      return null;
    }

    // Check if files are not too old (24 hours)
    const isExpired = Date.now() - storage.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      console.log('⏰ Files in localStorage have expired');
      clearLocalFiles();
      return null;
    }

    // Convert back to File objects
    const images = storage.images.map(sf => 
      base64ToFile(sf.data, sf.name, sf.type, sf.lastModified)
    );
    
    const videos = storage.videos.map(sf => 
      base64ToFile(sf.data, sf.name, sf.type, sf.lastModified)
    );

    console.log('✅ Files loaded from localStorage:', { 
      imagesCount: images.length, 
      videosCount: videos.length,
      sessionId: storage.sessionId 
    });
    
    return { images, videos };
  } catch (error) {
    console.error('❌ Error loading files from localStorage:', error);
    return null;
  }
};

// Clear files from localStorage
export const clearLocalFiles = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared files from localStorage');
};

// Get session ID from localStorage
export const getLocalSessionId = (): string | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const storage: LocalFileStorage = JSON.parse(stored);
    return storage.sessionId;
  } catch {
    return null;
  }
};

// Check if files exist in localStorage
export const hasLocalFiles = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return !!stored;
};