import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../utils/theme';

// 定义主题模式类型
type ThemeMode = 'light' | 'dark' | 'system';

// 定义主题上下文类型
interface ThemeContextType {
  themeMode: ThemeMode;
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题Provider组件
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 获取系统颜色模式
  const colorScheme = useColorScheme();

  // 主题模式状态（默认跟随系统）
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // 根据主题模式和系统颜色决定实际使用的主题
  const [isDarkMode, setIsDarkMode] = useState<boolean>(colorScheme === 'dark');

  // 监听主题模式或系统颜色变化
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDarkMode(colorScheme === 'dark');
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode, colorScheme]);

  // 切换主题
  const toggleTheme = () => {
    if (themeMode === 'system') {
      // 如果当前跟随系统，切换到与系统相反的模式
      setThemeMode(isDarkMode ? 'light' : 'dark');
    } else {
      // 如果当前是明确的模式，切换到相反的模式
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  // 当前使用的主题
  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    themeMode,
    theme,
    isDarkMode,
    toggleTheme,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// 自定义Hook，用于访问主题上下文
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}; 