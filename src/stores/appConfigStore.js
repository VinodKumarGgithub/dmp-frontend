import { create } from 'zustand';

/**
 * Application configuration store
 * Reads from environment variables with safe fallbacks
 */
const useAppConfigStore = create((set, get) => ({
  // Get application name from environment variable
  // Falls back to a generic name if not set
  getAppName: () => {
    return import.meta.env.VITE_APP_NAME || 'Data Manager Pro';
  },

  // Get application short name/abbreviation
  // Used for logos and compact displays
  getAppShortName: () => {
    return import.meta.env.VITE_APP_SHORT_NAME || 'DMP';
  },

  // Computed values for convenience (reactive)
  get appName() {
    return get().getAppName();
  },

  get appShortName() {
    return get().getAppShortName();
  },
}));

export default useAppConfigStore;

