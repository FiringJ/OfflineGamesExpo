import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储键名常量
const STORAGE_KEYS = {
  GAMES: 'offline_games_data',
  USER_PROGRESS: 'offline_games_user_progress',
  THEME: 'offline_games_theme',
  SETTINGS: 'offline_games_settings',
};

// 通用存储方法
const storeData = async (key: string, value: unknown): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

// 通用读取方法
const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    throw error;
  }
};

// 通用删除方法
const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

// 导出具体业务方法
export const storage = {
  // 游戏数据
  saveGames: (games: unknown) => storeData(STORAGE_KEYS.GAMES, games),
  getGames: <T>() => getData<T>(STORAGE_KEYS.GAMES),

  // 用户进度
  saveUserProgress: (progress: unknown) => storeData(STORAGE_KEYS.USER_PROGRESS, progress),
  getUserProgress: <T>() => getData<T>(STORAGE_KEYS.USER_PROGRESS),

  // 主题设置
  saveThemeSettings: (theme: unknown) => storeData(STORAGE_KEYS.THEME, theme),
  getThemeSettings: <T>() => getData<T>(STORAGE_KEYS.THEME),

  // 应用设置
  saveSettings: (settings: unknown) => storeData(STORAGE_KEYS.SETTINGS, settings),
  getSettings: <T>() => getData<T>(STORAGE_KEYS.SETTINGS),

  // 清除所有数据（用于重置应用）
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GAMES,
        STORAGE_KEYS.USER_PROGRESS,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },

  // 获取存储使用情况
  getStorageUsage: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);

      let totalSize = 0;
      const usage = result.map(([key, value]) => {
        const size = value ? value.length : 0;
        totalSize += size;
        return { key, size };
      });

      return {
        totalSize,
        items: usage,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  },
}; 