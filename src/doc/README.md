# 多游戏移动端应用 (Offline Games)

一个基于 React Native 和 Expo 的多游戏移动端应用，支持主流设备，遵循 Material Design 设计风格，提供多种离线游戏。

## 项目介绍

此应用旨在提供一个集成多种经典小游戏的平台，让用户无需网络连接也能享受游戏乐趣。应用采用 Material Design 风格，提供直观、美观的用户界面，支持 Android 和 iOS 平台。

### 主要功能

- 多种经典游戏（俄罗斯方块、贪吃蛇、扫雷等）
- 游戏收藏和管理
- 游戏进度保存
- 用户设置（主题、语言、声音等）
- 离线游戏，无需网络连接

## 目录结构

```
OfflineGamesExpo/
├── assets/                # 静态资源（图片、字体等）
├── components/            # Expo 默认组件目录
├── node_modules/          # 项目依赖
├── src/                   # 源代码
│   ├── assets/            # 静态资源（图片、字体等）
│   ├── components/        # 可复用组件
│   ├── games/             # 游戏实现
│   ├── navigation/        # 导航配置
│   ├── screens/           # 应用屏幕
│   ├── utils/             # 工具函数和常量
│   └── doc/               # 项目文档
├── .gitignore             # Git 忽略文件
├── app.json               # 应用配置
├── App.js                 # 应用入口
├── babel.config.js        # Babel 配置
├── package.json           # NPM 包配置
└── README.md              # 项目说明
```

## 技术选型

- **框架**: React Native with Expo
- **UI 库**: React Native Paper (Material Design)
- **导航**: React Navigation
- **图标**: React Native Vector Icons
- **状态管理**: React Hooks (useState, useContext)
- **开发语言**: JavaScript

## 依赖库

主要依赖库包括：

- expo: 最新版
- react-native: 最新版
- react-native-paper: 用于 Material Design 组件
- react-native-vector-icons: 提供图标支持
- @react-navigation/native: 导航基础库
- @react-navigation/native-stack: 堆栈导航
- @react-navigation/bottom-tabs: 底部标签导航

## 启动命令

### 安装依赖

```bash
npm install
```

### 启动 Expo 开发服务器

```bash
npm start
```

或者

```bash
npx expo start
```

### 在设备上运行

- 使用 Expo Go 应用扫描终端中显示的二维码
- 或者按照终端中的提示，输入相应命令运行在模拟器上

### 构建应用

```bash
# 构建 Android 应用
npx expo build:android

# 构建 iOS 应用
npx expo build:ios
```

## 游戏列表

当前集成的游戏包括：

1. 俄罗斯方块 (Tetris)
2. 贪吃蛇 (Snake)
3. 扫雷 (Minesweeper)
4. 2048
5. 飞机大战 (Airplane Battle)

## 使用 Expo 的优势

- 无需安装 Android Studio 或 Xcode 即可开发
- 通过 Expo Go 应用快速在真机上测试
- 简化的构建和发布流程
- 访问丰富的 Expo SDK 功能
- 更快的开发迭代

## 版本信息

当前版本: 1.0.0 