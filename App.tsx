import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, AppColorScheme } from './src/utils/theme';
import { GameProvider } from './src/context/GameContext';
import { AudioProvider } from './src/services/AudioService';
import { Text } from 'react-native';

export default function App() {
  // 系统颜色模式
  const colorScheme = useColorScheme();

  // 应用颜色模式状态
  const [appColorScheme, setAppColorScheme] = useState<AppColorScheme>('system');

  // 加载用户主题首选项
  useEffect(() => {
    const loadColorScheme = async () => {
      try {
        const savedColorScheme = await AsyncStorage.getItem('colorScheme');
        if (savedColorScheme) {
          setAppColorScheme(savedColorScheme as AppColorScheme);
        }
      } catch (error) {
        console.error('无法加载主题设置:', error);
      }
    };

    loadColorScheme();
  }, []);

  // 确定当前使用的主题
  const theme = React.useMemo(() => {
    if (appColorScheme === 'system') {
      return colorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return appColorScheme === 'dark' ? darkTheme : lightTheme;
  }, [appColorScheme, colorScheme]);

  // 设置颜色模式
  const setColorScheme = async (newColorScheme: AppColorScheme) => {
    setAppColorScheme(newColorScheme);
    try {
      await AsyncStorage.setItem('colorScheme', newColorScheme);
    } catch (error) {
      console.error('无法保存主题设置:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppearanceProvider>
        <PaperProvider theme={theme}>
          <AudioProvider>
            <GameProvider>
              <StatusBar style={theme === darkTheme ? 'light' : 'dark'} />
              <Text>已迁移到Expo Router，此文件不再使用</Text>
            </GameProvider>
          </AudioProvider>
        </PaperProvider>
      </AppearanceProvider>
    </SafeAreaProvider>
  );
} 