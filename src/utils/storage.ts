import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore: Record<string, string> = {};
let useMemoryFallback = false;

export const AppStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (useMemoryFallback) {
      return memoryStore[key] || null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null') || error?.message?.includes('database')) {
        useMemoryFallback = true;
        console.warn('AsyncStorage native module is missing. Using in-memory fallback.');
        return memoryStore[key] || null;
      }
      throw error;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (useMemoryFallback) {
      memoryStore[key] = value;
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null') || error?.message?.includes('database')) {
        useMemoryFallback = true;
        console.warn('AsyncStorage native module is missing. Using in-memory fallback.');
        memoryStore[key] = value;
        return;
      }
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (useMemoryFallback) {
      delete memoryStore[key];
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (error: any) {
      if (error?.message?.includes('Native module is null') || error?.message?.includes('database')) {
        useMemoryFallback = true;
        delete memoryStore[key];
        return;
      }
      throw error;
    }
  }
};
