import { DefaultTheme, configureFonts, MD3DarkTheme } from 'react-native-paper';
import { MD3Colors } from 'react-native-paper/lib/typescript/src/types';

// 定义自定义字体配置
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
};

// 主题颜色
export type AppColorScheme = 'light' | 'dark' | 'system';

// 自定义主题类型
export interface AppTheme {
  colors: typeof DefaultTheme.colors & {
    // 自定义颜色
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  roundness: number;
  fontSizes: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  };
}

// 浅色主题颜色
export const lightThemeColors = {
  ...DefaultTheme.colors,
  primary: '#6200ee',
  primaryContainer: '#e9ddff',
  secondary: '#03dac6',
  secondaryContainer: '#cefaf1',
  background: '#f6f6f6',
  surface: '#ffffff',
  error: '#b00020',
  text: '#000000',
  onSurface: '#000000',
  disabled: 'rgba(0, 0, 0, 0.26)',
  placeholder: 'rgba(0, 0, 0, 0.54)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#f50057',
  // 自定义颜色
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',
};

// 深色主题颜色
export const darkThemeColors = {
  ...MD3DarkTheme.colors,
  primary: '#bb86fc',
  primaryContainer: '#4e3c74',
  secondary: '#03dac6',
  secondaryContainer: '#005047',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#cf6679',
  onSurface: '#ffffff',
  text: '#ffffff',
  disabled: 'rgba(255, 255, 255, 0.38)',
  placeholder: 'rgba(255, 255, 255, 0.54)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#ff80ab',
  // 自定义颜色
  success: '#81C784',
  warning: '#FFB74D',
  info: '#64B5F6',
};

// 浅色主题
export const lightTheme: AppTheme = {
  ...DefaultTheme,
  colors: lightThemeColors,
  roundness: 8,
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
};

// 深色主题
export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: darkThemeColors,
  roundness: 8,
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
};

// 游戏特定颜色
export const gameColors = {
  // 2048游戏颜色
  game2048: {
    background: '#faf8ef',
    boardBackground: '#bbada0',
    emptyCell: 'rgba(238, 228, 218, 0.35)',
    tile2: '#eee4da',
    tile4: '#ede0c8',
    tile8: '#f2b179',
    tile16: '#f59563',
    tile32: '#f67c5f',
    tile64: '#f65e3b',
    tile128: '#edcf72',
    tile256: '#edcc61',
    tile512: '#edc850',
    tile1024: '#edc53f',
    tile2048: '#edc22e',
    textLight: '#f9f6f2',
    textDark: '#776e65',
    buttonBackground: '#8f7a66',
    buttonText: '#f9f6f2',
  },

  // 俄罗斯方块颜色
  tetris: {
    background: '#000',
    empty: '#111',
    block1: '#00f0f0', // I形方块 - 青色
    block2: '#0000f0', // J形方块 - 蓝色
    block3: '#f0a000', // L形方块 - 橙色
    block4: '#f0f000', // O形方块 - 黄色
    block5: '#00f000', // S形方块 - 绿色
    block6: '#a000f0', // T形方块 - 紫色
    block7: '#f00000', // Z形方块 - 红色
    border: '#333',
    text: '#fff',
    score: '#fff',
  },

  // 贪吃蛇颜色
  snake: {
    background: '#111',
    snake: '#4CAF50',
    snakeHead: '#8BC34A',
    food: '#F44336',
    border: '#333',
    text: '#fff',
    score: '#fff',
  },

  // 扫雷颜色
  minesweeper: {
    background: '#c0c0c0',
    hidden: '#c0c0c0',
    revealed: '#e0e0e0',
    border: '#808080',
    flag: '#ff0000',
    mine: '#000000',
  }
};

// 应用程序主题
export const appTheme = {
  // 导航相关颜色
  navigation: {
    primary: '#007aff',
    background: '#f7f7f7',
    card: '#fff',
    text: '#000',
    border: '#ddd',
    notification: '#ff3b30',
  },

  // 卡片相关颜色
  card: {
    background: '#fff',
    title: '#000',
    subtitle: '#666',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // 按钮相关颜色
  button: {
    primary: '#007aff',
    secondary: '#5856d6',
    success: '#4cd964',
    danger: '#ff3b30',
    warning: '#ffcc00',
    info: '#5ac8fa',
    light: '#f7f7f7',
    dark: '#1c1c1e',
    text: '#fff',
  },

  // 文本相关颜色
  text: {
    primary: '#000',
    secondary: '#666',
    tertiary: '#999',
    light: '#fff',
  },
};

// 导出默认主题作为当前主题
export const theme = lightTheme; 