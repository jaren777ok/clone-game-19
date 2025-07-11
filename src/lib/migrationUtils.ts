// Migration utilities to help transition from localStorage to database
export const clearLegacyLocalStorage = () => {
  // Clear old video generation state from localStorage
  const keysToRemove = [
    'video_generation_state',
    'video_generation_recovery',
    'video_monitoring_state'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🧹 Cleaning up legacy localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

// Check if user has any legacy localStorage data
export const hasLegacyData = (): boolean => {
  return !!(
    localStorage.getItem('video_generation_state') ||
    localStorage.getItem('video_generation_recovery') ||
    localStorage.getItem('video_monitoring_state')
  );
};

export const migrateLegacyData = () => {
  if (hasLegacyData()) {
    console.log('📦 Legacy localStorage data detected, clearing...');
    clearLegacyLocalStorage();
    console.log('✅ Legacy data migration complete');
  }
};