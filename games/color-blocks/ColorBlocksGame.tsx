import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, PanResponder, Animated, GestureResponderEvent, PanResponderGestureState, LayoutChangeEvent, Platform, Vibration } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

// 添加环境检测辅助函数
const isWeb = () => {
  return Platform.OS === 'web';
};

// 在文件顶部添加浏览器检测
const isChromeBrowser = () => {
  if (isWeb() && typeof navigator !== 'undefined' && navigator.userAgent) {
    return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  }
  return false;
};

// 添加禁用页面滚动功能
const preventPageScroll = (prevent: boolean) => {
  // 只在Web环境中运行
  if (!isWeb() || typeof document === 'undefined') return;

  if (prevent) {
    // 禁用滚动 - 使用更可靠的方法
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = `-${window.scrollY}px`; // 记住当前滚动位置
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden'; // 也为html元素设置
    document.documentElement.style.touchAction = 'none';
  } else {
    // 恢复滚动
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.top = '';
    document.body.style.touchAction = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.touchAction = '';

    // 恢复滚动位置
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  }
};

// 定义颜色映射
const COLORS = {
  empty: '#2E2A3C', // 空白格子颜色
  orange: '#FF8C00', // 橙色
  pink: '#FF1493',   // 粉色
  green: '#32CD32',  // 绿色
  purple: '#9932CC', // 紫色
  blue: '#1E90FF',   // 蓝色
};

// 游戏区域大小 - 8x8网格
const GRID_SIZE = 8;

// 计算方块大小，确保适合当前屏幕
const { width } = Dimensions.get('window');
const BLOCK_SIZE = Math.min(Math.floor((width - 80) / GRID_SIZE), 40);
const BOARD_SIZE = BLOCK_SIZE * GRID_SIZE;

// 定义方块形状库
const BLOCK_SHAPES = [
  // 单个方块
  [[1]],

  // 两个方块
  [[1], [1]],
  [[1, 1]],

  // L形状
  [[1, 0], [1, 1]],
  [[1, 1], [1, 0]],
  [[0, 1], [1, 1]],
  [[1, 1], [0, 1]],

  // 田字形
  [[1, 1], [1, 1]],

  // 长条
  [[1, 1, 1]],
  [[1], [1], [1]],

  // Z形状
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1], [1, 1], [1, 0]],

  // T形状
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
];

// 获取随机颜色（除了empty）
const getRandomColor = () => {
  const colorKeys = Object.keys(COLORS).filter(key => key !== 'empty') as Array<keyof typeof COLORS>;
  return COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
};

// 获取随机方块形状
const getRandomShape = () => {
  return BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
};

// 首先添加类型定义
interface Block {
  shape: number[][];
  color: string;
  position: Position;
  isPlaced: boolean;
}

// 修改Position类型，使其可空
type Position = {
  x: number;
  y: number;
} | null;

// 游戏板类型
type GameBoard = (string | null)[][];

// 历史记录类型
interface HistoryState {
  board: any;
  blocks: Block[];
  score: number;
}

// 游戏板布局状态
interface BoardLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 修复可能为null的SetStateAction问题
type PositionOrNull = Position | null;

// 优化移动端拖拽体验的常量
const DRAG_OFFSET_Y = Platform.OS === 'web' ? -30 : -40; // 增加偏移，让方块显示在手指上方
const DRAG_OFFSET_X = 0; // 水平偏移
const DRAG_OPACITY = 0.9; // 稍微提高拖动方块的不透明度，使其更容易看见

// 修复组件类型定义
interface BlockCellProps {
  x: number;
  y: number;
  color: string;
  opacity: Animated.Value;
}

const ColorBlocksGame = () => {
  const { updateGameScore, incrementPlayCount } = useGameContext();
  const router = useRouter();

  // 游戏状态
  const [gameBoard, setGameBoard] = useState<GameBoard>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(2974); // 示例最高分
  const [gameMode, setGameMode] = useState('HARD MODE');
  const [gameOver, setGameOver] = useState(false);

  // 可用方块列表 - 每个方块有形状和颜色
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);

  // 当前拖动的方块
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);

  // 幽灵块状态
  const [ghostPosition, setGhostPosition] = useState<Position>(null);
  const [isGhostValid, setIsGhostValid] = useState<boolean>(false);

  // 剩余操作次数
  const [undoCount, setUndoCount] = useState(1);
  const [hintCount, setHintCount] = useState(1);

  // 历史记录 - 用于撤销功能
  const [history, setHistory] = useState<HistoryState[]>([]);

  // 动画值
  const blockOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // 棋盘布局状态
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);

  const dragIndexRef = useRef<number | null>(null); // Ref to track the index being dragged

  // 添加Refs用于拖动位置追踪，避免闭包陷阱
  const dragPositionRef = useRef<Position>({ x: 0, y: 0 });
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 });

  // 添加音效引用
  const placeSoundRef = useRef<Audio.Sound | null>(null);
  const clearSoundRef = useRef<Audio.Sound | null>(null);
  const gameOverSoundRef = useRef<Audio.Sound | null>(null);
  const invalidSoundRef = useRef<Audio.Sound | null>(null);

  // 1. 先声明 canPlaceBlockAt
  const canPlaceBlockAt = useCallback((block: Block, position: Position): boolean => {
    if (!position) return false;

    if (!block || !block.shape) return false;

    const { shape } = block;
    const { x, y } = position;

    // 检查是否超出边界
    if (y < 0 || x < 0 || y + shape.length > GRID_SIZE || x + shape[0].length > GRID_SIZE) {
      return false;
    }

    // 检查是否与已有方块重叠
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
        if (shape[shapeY][shapeX] === 1) {
          const boardY = y + shapeY;
          const boardX = x + shapeX;

          if (gameBoard[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }

    return true;
  }, [gameBoard]);

  // 2. 然后声明 canPlaceBlockAnywhere
  const canPlaceBlockAnywhere = useCallback((block: Block): boolean => {
    if (!block) return false;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (canPlaceBlockAt(block, { x, y })) {
          return true;
        }
      }
    }
    return false;
  }, [canPlaceBlockAt]);

  // 3. 最后再声明 checkGameOver
  const checkGameOver = useCallback((): boolean | { shouldGenerateNewBlocks: boolean } => {
    // 首先检查当前可用的方块是否能放置在棋盘上
    const currentBlocksPlaceable = availableBlocks
      .filter(block => !block.isPlaced)
      .some(block => canPlaceBlockAnywhere(block));

    // 如果当前方块都无法放置，游戏结束
    if (!currentBlocksPlaceable && availableBlocks.some(block => !block.isPlaced)) {
      console.log("游戏结束: 当前方块无法放置");
      setGameOver(true);
      updateGameScore(1, score);
      return true;
    }

    // 检查是否还有可用的方块
    const hasAvailableBlocks = availableBlocks.some(block => !block.isPlaced);
    if (!hasAvailableBlocks) {
      // 创建测试方块但不更新状态
      const testBlocks = Array(3).fill(0).map(() => ({
        shape: getRandomShape(),
        color: getRandomColor(),
        position: { x: 0, y: 0 },
        isPlaced: false
      }));

      // 检查是否有位置可放置新方块
      let canContinue = false;
      for (const block of testBlocks) {
        if (canPlaceBlockAnywhere(block)) {
          canContinue = true;
          break;
        }
      }

      if (!canContinue) {
        console.log("游戏结束: 无法放置新方块");
        setGameOver(true);
        updateGameScore(1, score);
        return true;
      }

      // 让调用方决定是否生成新方块
      return { shouldGenerateNewBlocks: true };
    }
    return false;
  }, [availableBlocks, canPlaceBlockAnywhere, score, updateGameScore]);

  // 修改 generateNewBlocks 函数，让它返回生成的方块
  const generateNewBlocks = useCallback(() => {
    const newBlocks = Array(3).fill(0).map(() => ({
      shape: getRandomShape(),
      color: getRandomColor(),
      position: { x: 0, y: 0 },
      isPlaced: false
    }));
    setAvailableBlocks(newBlocks);
    return newBlocks; // 返回生成的方块
  }, []);

  // 游戏初始化
  const initGame = useCallback(() => {
    setGameBoard(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)));
    setScore(0);
    setGameOver(false);
    setUndoCount(1);
    setHintCount(1);
    setHistory([]);
    generateNewBlocks();
    incrementPlayCount(1);
  }, [incrementPlayCount, generateNewBlocks]);

  // 初始化游戏
  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 移除 initGame 依赖，确保只在挂载时运行一次

  // 加载音效
  useEffect(() => {
    async function loadSounds() {
      try {
        // 注意：需要确保这些音效文件存在，或者先使用占位音效
        const { sound: placeSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/place.mp3'),
          { volume: 0.5 }
        );
        placeSoundRef.current = placeSound;

        const { sound: clearSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/clear.mp3'),
          { volume: 0.7 }
        );
        clearSoundRef.current = clearSound;

        const { sound: gameOverSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/gameover.mp3'),
          { volume: 0.8 }
        );
        gameOverSoundRef.current = gameOverSound;

        const { sound: invalidSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/invalid.mp3'),
          { volume: 0.3 }
        );
        invalidSoundRef.current = invalidSound;
      } catch (error) {
        console.error("无法加载音效:", error);
      }
    }

    loadSounds();

    // 在组件卸载时卸载音效
    return () => {
      async function unloadSounds() {
        if (placeSoundRef.current) {
          await placeSoundRef.current.unloadAsync();
        }
        if (clearSoundRef.current) {
          await clearSoundRef.current.unloadAsync();
        }
        if (gameOverSoundRef.current) {
          await gameOverSoundRef.current.unloadAsync();
        }
        if (invalidSoundRef.current) {
          await invalidSoundRef.current.unloadAsync();
        }
      }
      unloadSounds();
    };
  }, []);

  // 播放音效的辅助函数
  const playSound = async (soundRef: React.MutableRefObject<Audio.Sound | null>) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error("播放音效失败:", error);
    }
  };

  // 振动反馈函数
  const vibrate = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50); // 短振动
    }
  };

  // 性能优化：使用memo缓存重复计算的方块组件
  const MemoizedBlockCell = React.memo(({ x, y, color, opacity }: BlockCellProps) => {
    return (
      <Animated.View
        style={[
          styles.blockCell,
          {
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            backgroundColor: color,
            opacity
          }
        ]}
      />
    );
  });

  // 修改checkAndClearLines函数，优化性能
  const checkAndClearLines = useCallback((board: GameBoard): { clearedLines: number, updatedBoard: GameBoard } => {
    // 浅拷贝而不是深拷贝，提高性能
    let newBoard: GameBoard = [...board.map(row => [...row])];
    let rowsCleared = 0;
    let colsCleared = 0;

    // 使用Set收集需要清除的行列，避免重复计算
    const completedRows = new Set<number>();
    const completedCols = new Set<number>();

    // 检查行
    for (let y = 0; y < GRID_SIZE; y++) {
      if (newBoard[y].every((cell: string | null) => cell !== null)) {
        completedRows.add(y);
        rowsCleared++;
      }
    }

    // 检查列
    for (let x = 0; x < GRID_SIZE; x++) {
      let isColComplete = true;
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!newBoard[y] || newBoard[y][x] === null) {
          isColComplete = false;
          break;
        }
      }
      if (isColComplete) {
        completedCols.add(x);
        colsCleared++;
      }
    }

    // 优化清除行的处理，只处理需要清除的行
    completedRows.forEach(y => {
      if (newBoard[y]) {
        for (let x = 0; x < GRID_SIZE; x++) {
          newBoard[y][x] = null;
        }
      }
    });

    // 优化清除列的处理，只处理需要清除的列
    completedCols.forEach(x => {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (newBoard[y]) {
          newBoard[y][x] = null;
        }
      }
    });

    // 更新游戏板状态
    if (rowsCleared > 0 || colsCleared > 0) {
      // 异步播放音效和震动，不阻塞UI
      setTimeout(() => {
        playSound(clearSoundRef);
        vibrate();
      }, 0);

      // 使用requestAnimationFrame优化动画性能
      requestAnimationFrame(() => {
        Animated.sequence([
          Animated.timing(blockOpacity, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(blockOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          })
        ]).start();
      });

      return {
        clearedLines: rowsCleared + colsCleared,
        updatedBoard: newBoard
      };
    }

    return {
      clearedLines: 0,
      updatedBoard: newBoard
    };
  }, [blockOpacity, playSound, vibrate]);

  // 优化放置方块函数
  const placeBlock = useCallback((block: Block, position: Position, blockIndex: number): boolean => {
    if (!block || !position || position.x < 0 || position.y < 0 || !canPlaceBlockAt(block, position)) return false;

    // 异步播放音效，不阻塞UI
    setTimeout(() => {
      playSound(placeSoundRef);
      vibrate();
    }, 0);

    // 保存当前状态到历史记录，使用浅拷贝而不是深拷贝
    setHistory(prev => [...prev, {
      board: [...gameBoard.map(row => [...row])],
      blocks: availableBlocks.map(b => ({ ...b })),
      score
    }]);

    // 更新游戏板，使用浅拷贝而不是深拷贝
    const newBoard: GameBoard = [...gameBoard.map(row => [...row])];
    const { shape, color } = block;

    shape.forEach((row: number[], shapeY: number) => {
      row.forEach((cell: number, shapeX: number) => {
        if (cell === 1) {
          const boardY = position.y + shapeY;
          const boardX = position.x + shapeX;
          if (boardY >= 0 && boardY < GRID_SIZE && boardX >= 0 && boardX < GRID_SIZE) {
            newBoard[boardY][boardX] = color;
          }
        }
      });
    });

    // 检查并清除完成的行列
    const { clearedLines, updatedBoard } = checkAndClearLines(newBoard);

    if (clearedLines > 0) {
      const bonus = clearedLines > 1 ? clearedLines * 0.5 : 1;
      const additionalScore = Math.floor(clearedLines * 100 * bonus);
      setScore(prevScore => prevScore + additionalScore);

      // 使用更新后的游戏板
      setGameBoard(updatedBoard);
    } else {
      // 如果没有消除行/列，使用放置方块后的游戏板
      setGameBoard(newBoard);
    }

    // 标记当前方块为已放置
    if (blockIndex !== null && blockIndex >= 0 && blockIndex < availableBlocks.length) {
      // 创建新的方块数组，将当前方块标记为已放置
      const updatedBlocks = availableBlocks.map((b, idx) =>
        idx === blockIndex ? { ...b, isPlaced: true } : b
      );

      // 更新可用方块列表
      setAvailableBlocks(updatedBlocks);

      // 检查是否所有方块都已放置，如果是则生成新方块
      const allBlocksPlaced = updatedBlocks.every(block => block.isPlaced);
      if (allBlocksPlaced) {
        generateNewBlocks();
      }
    }

    // 检查游戏是否结束或需要新方块
    const gameOverResult = checkGameOver();

    // 处理游戏结束或生成新块的逻辑
    if (typeof gameOverResult === 'object' && gameOverResult.shouldGenerateNewBlocks) {
      const nextBlocks = generateNewBlocks();
      const canPlaceNewBlock = nextBlocks.some(newBlock => canPlaceBlockAnywhere(newBlock));
      if (!canPlaceNewBlock) {
        setGameOver(true);
        updateGameScore(1, score);
        // 异步播放游戏结束音效
        setTimeout(() => {
          playSound(gameOverSoundRef);
        }, 0);
      }
    } else if (gameOverResult === true) {
      setGameOver(true);
      updateGameScore(1, score);
      // 异步播放游戏结束音效
      setTimeout(() => {
        playSound(gameOverSoundRef);
      }, 0);
    }

    return true;
  }, [gameBoard, availableBlocks, canPlaceBlockAt, score, checkAndClearLines, checkGameOver, generateNewBlocks, updateGameScore, canPlaceBlockAnywhere, playSound, vibrate]);

  // 撤销上一步操作
  const undoLastMove = useCallback(() => {
    if (history.length === 0 || undoCount <= 0) return;

    const lastState = history[history.length - 1];
    setGameBoard(lastState.board);
    setAvailableBlocks(lastState.blocks);
    setScore(lastState.score);
    setHistory(prev => prev.slice(0, -1));
    setUndoCount(prev => prev - 1);
  }, [history, undoCount]);

  // 使用提示功能
  const useHint = useCallback(() => {
    if (hintCount <= 0) return;

    // 寻找一个可以放置的位置
    for (let blockIndex = 0; blockIndex < availableBlocks.length; blockIndex++) {
      const block = availableBlocks[blockIndex];
      if (block.isPlaced) continue;

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (canPlaceBlockAt(block, { x, y })) {
            // 显示提示动画
            Animated.sequence([
              Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(shakeAnimation, {
                toValue: 5,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true
              })
            ]).start();

            setHintCount(prev => prev - 1);
            return; // 只提示一次
          }
        }
      }
    }
  }, [availableBlocks, canPlaceBlockAt, hintCount]);

  // 获取棋盘布局
  const onBoardLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setBoardLayout({ x, y, width, height });
  };

  // 修改useEffect以更安全地处理事件 - 避免在移动端使用document
  useEffect(() => {
    // 仅在Web环境中执行以下操作
    if (!isWeb()) return;

    // Chrome浏览器特殊处理
    let isChromeOnTouchDevice = false;
    try {
      isChromeOnTouchDevice = isChromeBrowser() && ('ontouchstart' in window);
    } catch (e) {
      console.log('Error detecting touch device:', e);
    }

    // 全局CSS类，直接禁用文档滚动
    const addNoScrollStyle = () => {
      if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = 'no-scroll-style';
        style.innerHTML = `
          body.no-scroll {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
            touch-action: none !important;
          }
          html.no-scroll {
            overflow: hidden !important;
            touch-action: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    // 添加全局样式
    addNoScrollStyle();

    // 仅在拖动过程中应用no-scroll类
    const enableNoScroll = () => {
      if (typeof document !== 'undefined') {
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');
      }
    };

    const disableNoScroll = () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
      }
    };

    // 替代事件监听器方法
    const handleDragStart = () => {
      enableNoScroll();
    };

    const handleDragEnd = () => {
      disableNoScroll();
    };

    // 将方法暴露给全局，以便PanResponder可以调用
    if (typeof window !== 'undefined') {
      (window as any).__colorBlocksGame = {
        handleDragStart,
        handleDragEnd
      };
    }

    // 组件卸载时清理
    return () => {
      disableNoScroll();
      if (typeof document !== 'undefined') {
        const styleElement = document.getElementById('no-scroll-style');
        if (styleElement) {
          styleElement.remove();
        }
      }

      if (typeof window !== 'undefined') {
        delete (window as any).__colorBlocksGame;
      }
    };
  }, []);

  // 修改createPanResponder以适应不同环境
  const createPanResponder = useCallback((blockIndex: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: (): boolean => true,
      // 仅当移动超过阈值时才设置移动响应器
      onMoveShouldSetPanResponder: (evt, gestureState): boolean => {
        // Only set if not already dragging *something* (avoid conflicts)
        // And movement exceeds threshold
        return (dragIndexRef.current === null || dragIndexRef.current === blockIndex) &&
          (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // 记录起始位置
        const pageX = evt.nativeEvent.pageX;
        const pageY = evt.nativeEvent.pageY;

        // 记录起始位置 - 使用页面绝对坐标
        initialPositionRef.current = { x: pageX, y: pageY };
        dragPositionRef.current = { x: pageX, y: pageY };

        // 立即设置拖动位置和方块，避免延迟
        setDragPosition({ x: pageX, y: pageY });
        setDraggedBlock(availableBlocks[blockIndex]);

        // 使用新方法禁用滚动 - 仅在Web环境中
        if (isWeb() && typeof window !== 'undefined' && (window as any).__colorBlocksGame) {
          (window as any).__colorBlocksGame.handleDragStart();
        }

        // Store the potential drag target index *immediately* in the ref
        dragIndexRef.current = blockIndex;
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (dragIndexRef.current === blockIndex && availableBlocks[blockIndex]) {
          // 获取事件的绝对坐标
          const pageX = evt.nativeEvent.pageX;
          const pageY = evt.nativeEvent.pageY;

          // 更新拖动位置
          dragPositionRef.current = { x: pageX, y: pageY };

          // 更新当前的拖动状态
          setDragPosition({ x: pageX, y: pageY });

          // 设置当前拖动的方块
          setDraggedBlock(availableBlocks[blockIndex]);

          // 更新幽灵块位置 - 仅当有棋盘布局和拖动方块时
          if (boardLayout && availableBlocks[blockIndex]) {
            const dragBlock = availableBlocks[blockIndex];

            // 计算方块在棋盘上的位置
            const blockPixelWidth = (dragBlock.shape[0]?.length || 1) * BLOCK_SIZE * 0.8;
            const blockPixelHeight = (dragBlock.shape.length || 1) * BLOCK_SIZE * 0.8;

            // 使用正确的坐标计算位置
            const blockScreenTopLeftX = pageX - blockPixelWidth / 2;
            const blockScreenTopLeftY = pageY - blockPixelHeight / 2;

            // 添加偏移补偿 - 使用平台特定偏移
            const offsetX = 0;
            let offsetY = DRAG_OFFSET_Y;

            const adjustedScreenX = blockScreenTopLeftX + offsetX;
            const adjustedScreenY = blockScreenTopLeftY + offsetY;

            // 使用Math.max确保坐标非负
            const safeLayoutX = Math.max(0, boardLayout.x);
            const safeLayoutY = Math.max(0, boardLayout.y);

            const blockBoardTopLeftX = adjustedScreenX - safeLayoutX;
            const blockBoardTopLeftY = adjustedScreenY - safeLayoutY;

            // 计算目标格子
            const boardX = Math.floor(blockBoardTopLeftX / BLOCK_SIZE);
            const boardY = Math.floor(blockBoardTopLeftY / BLOCK_SIZE);

            // 验证是否是有效的放置位置
            if (boardX >= 0 && boardY >= 0 && boardX < GRID_SIZE && boardY < GRID_SIZE) {
              const canPlace = canPlaceBlockAt(dragBlock, { x: boardX, y: boardY });
              setGhostPosition({ x: boardX, y: boardY });
              setIsGhostValid(canPlace);
            } else {
              // 超出棋盘范围，不显示幽灵块
              setGhostPosition(null);
            }
          }
        }
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // 使用新方法恢复滚动 - 仅在Web环境中
        if (isWeb() && typeof window !== 'undefined' && (window as any).__colorBlocksGame) {
          (window as any).__colorBlocksGame.handleDragEnd();
        }

        if (dragIndexRef.current === blockIndex && draggedBlock) {
          // 使用幽灵块位置
          if (ghostPosition && isGhostValid) {
            // 克隆ghostPosition，避免引用问题
            const positionToUse = { x: ghostPosition.x, y: ghostPosition.y };

            let placed = placeBlock(draggedBlock, positionToUse, dragIndexRef.current);

            if (!placed) {
              const validCheck = canPlaceBlockAt(draggedBlock, positionToUse);
              showShakeAnimation();
              // 异步播放音效
              setTimeout(() => {
                playSound(invalidSoundRef);
              }, 0);
            }
          } else if (ghostPosition) {
            showShakeAnimation();
            // 异步播放音效
            setTimeout(() => {
              playSound(invalidSoundRef);
            }, 0);
          } else {
            showShakeAnimation();
            // 异步播放音效
            setTimeout(() => {
              playSound(invalidSoundRef);
            }, 0);
          }

          // 结束拖动状态
          setDraggedBlock(null);
          setDragPosition(null);
          setGhostPosition(null);
          setIsGhostValid(false);
          dragIndexRef.current = null;
        }

        // 无论是否成功放置，最后都清除幽灵块
        setGhostPosition(null);
        setIsGhostValid(false);
      },
      onPanResponderTerminate: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        console.log(`PanResponder terminated for index: ${blockIndex}`);

        // 使用新方法恢复滚动 - 仅在Web环境中
        if (isWeb() && typeof window !== 'undefined' && (window as any).__colorBlocksGame) {
          (window as any).__colorBlocksGame.handleDragEnd();
        }

        if (dragIndexRef.current === blockIndex) {
          console.log("Resetting drag state due to termination");
        }
        dragIndexRef.current = null;
        setDraggedBlock(null);
        setDragPosition({ x: 0, y: 0 });
        setGhostPosition(null);
        setIsGhostValid(false);
      },
      onPanResponderTerminationRequest: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => false,
    });
  }, [availableBlocks, boardLayout, canPlaceBlockAt, placeBlock, ghostPosition, isGhostValid]);

  // 渲染游戏板上的单个方块
  const renderBlockCell = (x: number, y: number) => {
    const cellColor = gameBoard[y]?.[x] || COLORS.empty;
    return (
      <MemoizedBlockCell
        key={`cell-${x}-${y}`}
        x={x}
        y={y}
        color={cellColor}
        opacity={blockOpacity}
      />
    );
  };

  // 渲染游戏板
  const renderBoard = () => {
    return (
      <Animated.View
        onLayout={onBoardLayout}
        style={[
          styles.board,
          {
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            transform: [{ translateX: shakeAnimation }]
          }
        ]}
      >
        {gameBoard.map((row, y) => (
          <View key={`row-${y}`} style={styles.row}>
            {row.map((_, x) => renderBlockCell(x, y))}
          </View>
        ))}
      </Animated.View>
    );
  };

  // 渲染可用方块
  const renderAvailableBlocks = () => {
    return (
      <View style={styles.blocksContainer}>
        {availableBlocks.map((block, index) => {
          if (block.isPlaced || index === currentBlockIndex) return null;

          const panResponder = createPanResponder(index);

          return (
            <View
              key={`block-${index}`}
              {...panResponder.panHandlers}
              style={styles.blockItem}
            >
              {block.shape.map((row, y) => (
                <View key={`block-row-${y}`} style={styles.blockRow}>
                  {row.map((cell, x) => (
                    <View
                      key={`block-cell-${x}-${y}`}
                      style={[
                        styles.blockPieceBase,
                        {
                          backgroundColor: cell === 1 ? block.color : 'transparent',
                        },
                        cell === 1 ? styles.blockPieceBorder : null,
                        {
                          width: BLOCK_SIZE * 0.8,
                          height: BLOCK_SIZE * 0.8,
                        }
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // 渲染拖动中的方块
  const renderDraggedBlock = () => {
    if (!draggedBlock || !dragPosition) return null;

    // 获取拖动方块的像素尺寸
    const blockPixelWidth = (draggedBlock.shape[0]?.length || 1) * BLOCK_SIZE * 0.8;
    const blockPixelHeight = (draggedBlock.shape.length || 1) * BLOCK_SIZE * 0.8;

    // 根据平台设置不同的偏移量 - 增大偏移让用户更好地看到方块
    const topOffset = dragPosition.y - (blockPixelHeight / 2) + DRAG_OFFSET_Y;
    const leftOffset = dragPosition.x - (blockPixelWidth / 2) + DRAG_OFFSET_X;

    return (
      <Animated.View
        style={[
          styles.draggedBlock,
          {
            left: leftOffset,
            top: topOffset,
            opacity: DRAG_OPACITY,
            transform: [
              { scale: 1.05 } // 稍微放大拖动中的方块，提高可见性
            ]
          }
        ]}
        pointerEvents="none"
      >
        {draggedBlock.shape.map((row, y) => (
          <View key={`drag-row-${y}`} style={styles.blockRow}>
            {row.map((cell, x) => (
              <View
                key={`drag-cell-${x}-${y}`}
                style={[
                  styles.blockPieceBase,
                  {
                    width: BLOCK_SIZE * 0.8,
                    height: BLOCK_SIZE * 0.8,
                    backgroundColor: cell === 1 ? draggedBlock.color : 'transparent'
                  },
                  cell === 1 ? styles.blockPieceBorder : null
                ]}
              />
            ))}
          </View>
        ))}
      </Animated.View>
    );
  };

  // 渲染幽灵块 - 显示在棋盘上方，用于预览方块将放置的位置
  const renderGhostBlock = () => {
    if (!ghostPosition || !draggedBlock || !boardLayout) return null;

    // 计算在屏幕上的位置
    const boardX = boardLayout.x + ghostPosition.x * BLOCK_SIZE;
    const boardY = boardLayout.y + ghostPosition.y * BLOCK_SIZE;

    // 增强幽灵块视觉效果
    const ghostColor = isGhostValid
      ? { backgroundColor: 'rgba(0, 255, 0, 0.4)', borderColor: 'rgba(0, 255, 0, 0.7)' }
      : { backgroundColor: 'rgba(255, 0, 0, 0.4)', borderColor: 'rgba(255, 0, 0, 0.7)' };

    return (
      <View
        style={[
          styles.ghostBlock,
          {
            position: 'absolute',
            left: boardX,
            top: boardY,
            width: BLOCK_SIZE * 5,
            height: BLOCK_SIZE * 5,
            backgroundColor: 'transparent',
            zIndex: 10,
            pointerEvents: 'none',
          }
        ]}
      >
        {draggedBlock.shape.map((row, rowIndex) => {
          return row.map((cell, colIndex) => {
            if (cell === 0) return null;
            return (
              <View
                key={`ghost-${rowIndex}-${colIndex}`}
                style={{
                  position: 'absolute',
                  left: colIndex * BLOCK_SIZE,
                  top: rowIndex * BLOCK_SIZE,
                  width: BLOCK_SIZE - 1,
                  height: BLOCK_SIZE - 1,
                  backgroundColor: ghostColor.backgroundColor,
                  borderWidth: 2,
                  borderColor: ghostColor.borderColor,
                  borderRadius: 3,
                }}
              />
            );
          });
        })}
      </View>
    );
  };

  // 渲染游戏结束界面
  const renderGameOver = () => {
    if (!gameOver) return null;

    return (
      <View style={styles.gameOverContainer}>
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverText}>游戏结束!</Text>
          <Text style={styles.gameOverMessage}>无法放置更多方块</Text>
          <Text style={styles.finalScoreText}>最终得分: {score}</Text>
          <TouchableOpacity style={styles.gameOverResetButton} onPress={initGame}>
            <Text style={styles.resetButtonText}>重新开始</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 单独提取震动动画逻辑，避免代码重复
  const showShakeAnimation = () => {
    // 轻微振动反馈
    vibrate();

    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true
      })
    ]).start();
  };

  // 增强初始化和重置逻辑
  useEffect(() => {
    // 检查游戏状态
    const gameStatus = checkGameOver();
    // 如果游戏结束，需要确保分数被记录
    if (gameStatus === true) {
      console.log("初始检查：游戏已结束");
      updateGameScore(1, score);
    }
  }, [availableBlocks, checkGameOver, updateGameScore, score]);

  return (
    <View
      style={styles.container}
      // 移除会导致警告的preventDefault调用 - 环境检测
      onTouchStart={(e) => isWeb() && dragIndexRef.current !== null && (e.stopPropagation())}
    >
      {/* 顶部状态栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#9881FE" />
        </TouchableOpacity>

        <View style={styles.scoreContainer}>
          <Text style={styles.modeText}>{gameMode}</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>

        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreLabel}>ALL TIME</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={initGame}>
          <Ionicons name="refresh" size={28} color="#FF9DBA" />
        </TouchableOpacity>
      </View>

      {/* 游戏区域 */}
      {renderBoard()}

      {/* 幽灵块 - 放在棋盘和可用方块之间，这样会被拖动的方块覆盖 */}
      {renderGhostBlock()}

      {/* 可用方块 */}
      {renderAvailableBlocks()}

      {/* 拖动中的方块 */}
      {renderDraggedBlock()}

      {/* 底部操作按钮 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={undoLastMove}>
          <Ionicons name="arrow-undo" size={36} color="white" />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{undoCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hintButton} onPress={useHint}>
          <Ionicons name="bulb" size={36} color="white" />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{hintCount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 游戏结束界面 */}
      {renderGameOver()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#332B4A',
    paddingVertical: 20,
    position: 'relative',
    overflow: 'hidden',  // 防止内容溢出
    touchAction: 'none',  // 让浏览器知道我们将自己处理所有触摸操作
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    backgroundColor: '#1A1726',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  modeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  highScoreContainer: {
    backgroundColor: '#1A1726',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  highScoreLabel: {
    color: '#4DF8E8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  highScoreValue: {
    color: '#4DF8E8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  board: {
    backgroundColor: '#271F39',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3D325A',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  blockCell: {
    borderColor: '#3D325A',
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  blocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
  },
  blockItem: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockRow: {
    flexDirection: 'row',
  },
  blockPieceBase: {
    margin: 1,
  },
  blockPieceBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
  },
  blockPiece: {  // 添加这个样式以修复错误
    margin: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
  },
  draggedBlock: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    opacity: 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  ghostBlock: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hintButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameOverContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverContent: {
    backgroundColor: '#1A1726',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    maxWidth: '80%',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  gameOverText: {
    color: '#FF0000',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gameOverMessage: {
    color: '#FFA500',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  finalScoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameOverResetButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ColorBlocksGame; 