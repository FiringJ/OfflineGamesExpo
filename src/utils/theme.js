import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976D2', // Material Design 蓝色
    accent: '#FF4081', // Material Design 粉色
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  fonts: {
    ...DefaultTheme.fonts,
    // 可以在这里自定义字体
  },
  roundness: 4,
  animation: {
    scale: 1.0,
  },
}; 