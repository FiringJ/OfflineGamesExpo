import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 定义游戏类型
interface Game {
  id: number;
  title: string;
  highScore: number;
  lastPlayed: Date | null;
  isFavorite: boolean;
}

// 定义用户进度类型
interface UserProgress {
  totalScore: number;
  gamesPlayed: number;
  achievements: string[];
}

// 游戏数据类型
interface GameData {
  highScore: number;
  lastPlayed?: Date;
  playCount: number;
}

// 上下文状态
interface GameContextState {
  gameData: Record<number, GameData>;
  updateGameScore: (gameId: number, score: number) => void;
  incrementPlayCount: (gameId: number) => void;
  resetGameStats: (gameId: number) => void;
  resetAllStats: () => void;
}

// 定义上下文类型
interface GameContextType {
  games: Game[];
  userProgress: UserProgress;
  favorites: Game[];
  recentGames: Game[];
  addGame: (game: Game) => void;
  updateGame: (id: number, updates: Partial<Game>) => void;
  toggleFavorite: (id: number) => void;
  updateScore: (id: number, score: number) => void;
  addAchievement: (achievement: string) => void;
}

// 创建上下文
const GameContext = createContext<GameContextState | undefined>(undefined);

// 上下文Provider组件
interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // 所有游戏的数据状态
  const [gameData, setGameData] = useState<Record<number, GameData>>({});

  // 从存储加载游戏数据
  const loadGameData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('gameData');
      if (storedData) {
        setGameData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('加载游戏数据失败:', error);
    }
  };

  // 保存游戏数据到存储
  const saveGameData = async (data: Record<number, GameData>) => {
    try {
      await AsyncStorage.setItem('gameData', JSON.stringify(data));
    } catch (error) {
      console.error('保存游戏数据失败:', error);
    }
  };

  // 更新游戏分数
  const updateGameScore = (gameId: number, score: number) => {
    setGameData(prevData => {
      // 获取当前游戏数据或创建新记录
      const currentGame = prevData[gameId] || { highScore: 0, playCount: 0 };

      // 只有当新分数高于最高分时才更新
      if (score > currentGame.highScore) {
        const updatedData = {
          ...prevData,
          [gameId]: {
            ...currentGame,
            highScore: score,
            lastPlayed: new Date(),
          }
        };

        // 保存更新的数据
        saveGameData(updatedData);
        return updatedData;
      }

      return prevData;
    });
  };

  // 增加游戏的游玩次数
  const incrementPlayCount = (gameId: number) => {
    setGameData(prevData => {
      // 获取当前游戏数据或创建新记录
      const currentGame = prevData[gameId] || { highScore: 0, playCount: 0 };

      const updatedData = {
        ...prevData,
        [gameId]: {
          ...currentGame,
          playCount: currentGame.playCount + 1,
          lastPlayed: new Date(),
        }
      };

      // 保存更新的数据
      saveGameData(updatedData);
      return updatedData;
    });
  };

  // 重置特定游戏的统计数据
  const resetGameStats = (gameId: number) => {
    setGameData(prevData => {
      const updatedData = { ...prevData };
      if (updatedData[gameId]) {
        updatedData[gameId] = { highScore: 0, playCount: 0 };
        saveGameData(updatedData);
      }
      return updatedData;
    });
  };

  // 重置所有游戏的统计数据
  const resetAllStats = () => {
    setGameData({});
    saveGameData({});
  };

  // 首次加载时获取数据
  useEffect(() => {
    loadGameData();
  }, []);

  // 初始游戏列表
  const [games, setGames] = useState<Game[]>([
    {
      id: 1,
      title: '俄罗斯方块',
      highScore: 0,
      lastPlayed: null,
      isFavorite: false
    },
    {
      id: 2,
      title: '贪吃蛇',
      highScore: 0,
      lastPlayed: null,
      isFavorite: false
    },
    {
      id: 3,
      title: '扫雷',
      highScore: 0,
      lastPlayed: null,
      isFavorite: false
    },
    {
      id: 4,
      title: '2048',
      highScore: 0,
      lastPlayed: null,
      isFavorite: false
    },
    {
      id: 5,
      title: '水滴分类',
      highScore: 0,
      lastPlayed: null,
      isFavorite: false
    },
  ]);

  // 用户进度
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalScore: 0,
    gamesPlayed: 0,
    achievements: [],
  });

  // 添加新游戏
  const addGame = (game: Game) => {
    setGames(prevGames => [...prevGames, game]);
  };

  // 更新游戏信息
  const updateGame = (id: number, updates: Partial<Game>) => {
    setGames(prevGames =>
      prevGames.map(game =>
        game.id === id ? { ...game, ...updates } : game
      )
    );
  };

  // 收藏/取消收藏游戏
  const toggleFavorite = (id: number) => {
    setGames(prevGames =>
      prevGames.map(game =>
        game.id === id ? { ...game, isFavorite: !game.isFavorite } : game
      )
    );
  };

  // 更新游戏分数
  const updateScore = (id: number, score: number) => {
    setGames(prevGames =>
      prevGames.map(game => {
        if (game.id === id && score > game.highScore) {
          return {
            ...game,
            highScore: score,
            lastPlayed: new Date()
          };
        }
        return game.id === id ? { ...game, lastPlayed: new Date() } : game;
      })
    );

    setUserProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  // 添加成就
  const addAchievement = (achievement: string) => {
    setUserProgress(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement],
    }));
  };

  // 获取收藏的游戏
  const favorites = games.filter(game => game.isFavorite);

  // 获取最近玩过的游戏
  const recentGames = [...games]
    .filter(game => game.lastPlayed !== null)
    .sort((a, b) => {
      if (a.lastPlayed === null) return 1;
      if (b.lastPlayed === null) return -1;
      return b.lastPlayed.getTime() - a.lastPlayed.getTime();
    })
    .slice(0, 5);

  const value = {
    gameData,
    updateGameScore,
    incrementPlayCount,
    resetGameStats,
    resetAllStats,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// 自定义Hook，用于访问游戏上下文
export const useGameContext = (): GameContextState => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 