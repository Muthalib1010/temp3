import AsyncStorage from '@react-native-async-storage/async-storage';

const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(key);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('Storage getItem error:', e);
    }
    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
        return;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage setItem error:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
        return;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Storage removeItem error:', e);
    }
  }
};

export const StorageKeys = {
  AUTH_TOKEN: 'agri_farmer_token',
  USER_PROFILE: 'agri_farmer_profile',
  LANGUAGE: 'agri_farmer_lang',
  CACHED_BOOKING: 'agri_cached_booking',
  CACHED_DIGITAL_PASS: 'agri_cached_pass',
  CACHED_MANDIS: 'agri_cached_mandis',
  CACHED_CROPS: 'agri_cached_crops',
  OFFLINE_DATA_TIMESTAMP: 'agri_offline_ts',
};

export default safeStorage;
