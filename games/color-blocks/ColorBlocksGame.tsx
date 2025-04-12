import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { useGameContext } from '../../context/GameContext';
import { Ionicons } from '@expo/vector-icons';

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
  position: { x: number; y: number };
  isPlaced: boolean;
}

// 历史记录类型
interface HistoryState {
  board: any;
  blocks: Block[];
  score: number;
}

const ColorBlocksGame = () => {
  const { updateGameScore, incrementPlayCount } = useGameContext();

  // 游戏状态
  const [gameBoard, setGameBoard] = useState(
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
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [currentBlockIndex, setCurrentBlockIndex] = useState(null);

  // 剩余操作次数
  const [undoCount, setUndoCount] = useState(1);
  const [hintCount, setHintCount] = useState(1);

  // 历史记录 - 用于撤销功能
  const [history, setHistory] = useState<HistoryState[]>([]);

  // 动画值
  const blockOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // 1. 先声明 canPlaceBlockAt
  const canPlaceBlockAt = useCallback((block, position) => {
    if (!block || !block.shape) return false;

    const { shape } = block;
    const { x, y } = position;

    // 检查是否超出边界
    if (y + shape.length > GRID_SIZE || x + shape[0].length > GRID_SIZE) {
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
  const canPlaceBlockAnywhere = useCallback((block) => {
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
  const checkGameOver = useCallback(() => {
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
        setGameOver(true);
        updateGameScore(1, score);
        return true;
      }

      // 重要修改：不在这里调用 generateNewBlocks，而是返回一个标志
      // 让调用方决定是否生成新方块
      return { shouldGenerateNewBlocks: true };
    }
    return false;
  }, [availableBlocks, score, updateGameScore, canPlaceBlockAnywhere]);

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

  // 放置方块
  const placeBlock = useCallback((block, position, blockIndex) => {
    if (!block || !canPlaceBlockAt(block, position)) return false;

    // 保存当前状态到历史记录
    setHistory(prev => [...prev, {
      board: JSON.parse(JSON.stringify(gameBoard)),
      blocks: JSON.parse(JSON.stringify(availableBlocks)),
      score
    }]);

    // 更新游戏板
    const newBoard = [...gameBoard];
    const { shape, color } = block;

    shape.forEach((row, shapeY) => {
      row.forEach((cell, shapeX) => {
        if (cell === 1) {
          const boardY = position.y + shapeY;
          const boardX = position.x + shapeX;
          newBoard[boardY][boardX] = color;
        }
      });
    });

    setGameBoard(newBoard);

    // 标记方块为已放置
    const newBlocks = [...availableBlocks];
    newBlocks[blockIndex].isPlaced = true;
    setAvailableBlocks(newBlocks);

    // 检查并清除完成的行列
    checkAndClearLines(newBoard);

    // 检查游戏是否结束
    const gameOverResult = checkGameOver();
    if (gameOverResult && gameOverResult.shouldGenerateNewBlocks) {
      // 只有在需要时才生成新方块
      generateNewBlocks();
    }

    return true;
  }, [gameBoard, availableBlocks, canPlaceBlockAt, score, checkGameOver, generateNewBlocks]);

  // 检查并清除完成的行列
  const checkAndClearLines = useCallback((board) => {
    let newBoard = [...board];
    let rowsCleared = 0;
    let colsCleared = 0;

    // 检查行
    const completedRows = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const isRowComplete = newBoard[y].every(cell => cell !== null);
      if (isRowComplete) {
        completedRows.push(y);
        rowsCleared++;
      }
    }

    // 检查列
    const completedCols = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let isColComplete = true;
      for (let y = 0; y < GRID_SIZE; y++) {
        if (newBoard[y][x] === null) {
          isColComplete = false;
          break;
        }
      }
      if (isColComplete) {
        completedCols.push(x);
        colsCleared++;
      }
    }

    // 清除行
    completedRows.forEach(y => {
      for (let x = 0; x < GRID_SIZE; x++) {
        newBoard[y][x] = null;
      }
    });

    // 清除列
    completedCols.forEach(x => {
      for (let y = 0; y < GRID_SIZE; y++) {
        newBoard[y][x] = null;
      }
    });

    // 更新游戏板
    if (rowsCleared > 0 || colsCleared > 0) {
      setGameBoard(newBoard);

      // 计算得分：每行/列100分，连续消除有加成
      const totalCleared = rowsCleared + colsCleared;
      const bonus = totalCleared > 1 ? totalCleared * 0.5 : 1; // 连消加成
      const additionalScore = Math.floor(totalCleared * 100 * bonus);

      setScore(prevScore => prevScore + additionalScore);

      // 播放消除动画
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
    }
  }, []);

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

  // 创建拖动手势响应器
  const createPanResponder = (blockIndex) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setCurrentBlockIndex(blockIndex);
        setDraggedBlock(availableBlocks[blockIndex]);
      },
      onPanResponderMove: (evt, gestureState) => {
        setDragPosition({
          x: gestureState.moveX,
          y: gestureState.moveY
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        // 计算放置的网格位置
        const boardX = Math.floor((gestureState.moveX - (width - BOARD_SIZE) / 2) / BLOCK_SIZE);
        const boardY = Math.floor((gestureState.moveY - 200) / BLOCK_SIZE);

        // 尝试放置方块
        if (
          boardX >= 0 && boardX < GRID_SIZE &&
          boardY >= 0 && boardY < GRID_SIZE
        ) {
          const placed = placeBlock(draggedBlock, { x: boardX, y: boardY }, currentBlockIndex);
          if (!placed) {
            // 放置失败，显示抖动动画
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
          }
        }

        // 重置拖动状态
        setDraggedBlock(null);
        setCurrentBlockIndex(null);
      }
    });
  };

  // 渲染游戏板上的单个方块
  const renderBlockCell = (x, y) => {
    const cellColor = gameBoard[y][x] || COLORS.empty;

    return (
      <Animated.View
        key={`cell-${x}-${y}`}
        style={[
          styles.blockCell,
          {
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            backgroundColor: cellColor,
            opacity: blockOpacity
          }
        ]}
      />
    );
  };

  // 渲染游戏板
  const renderBoard = () => {
    return (
      <Animated.View
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
                        styles.blockPiece,
                        {
                          width: BLOCK_SIZE * 0.8,
                          height: BLOCK_SIZE * 0.8,
                          backgroundColor: cell === 1 ? block.color : 'transparent'
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
    if (!draggedBlock) return null;

    return (
      <View
        style={[
          styles.draggedBlock,
          {
            left: dragPosition.x - BLOCK_SIZE,
            top: dragPosition.y - BLOCK_SIZE
          }
        ]}
      >
        {draggedBlock.shape.map((row, y) => (
          <View key={`drag-row-${y}`} style={styles.blockRow}>
            {row.map((cell, x) => (
              <View
                key={`drag-cell-${x}-${y}`}
                style={[
                  styles.blockPiece,
                  {
                    width: BLOCK_SIZE * 0.8,
                    height: BLOCK_SIZE * 0.8,
                    backgroundColor: cell === 1 ? draggedBlock.color : 'transparent'
                  }
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  // 渲染游戏结束界面
  const renderGameOver = () => {
    if (!gameOver) return null;

    return (
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverText}>游戏结束!</Text>
        <Text style={styles.finalScoreText}>最终得分: {score}</Text>
        <TouchableOpacity style={styles.gameOverResetButton} onPress={initGame}>
          <Text style={styles.resetButtonText}>重新开始</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部状态栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FF9DBA" />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#332B4A',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
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
    minWidth: 120,
  },
  modeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  highScoreContainer: {
    backgroundColor: '#1A1726',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  highScoreLabel: {
    color: '#4DF8E8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  highScoreValue: {
    color: '#4DF8E8',
    fontSize: 24,
    fontWeight: 'bold',
  },
  board: {
    backgroundColor: '#271F39',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3D325A',
  },
  row: {
    flexDirection: 'row',
  },
  blockCell: {
    borderWidth: 1,
    borderColor: '#3D325A',
  },
  blocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
  },
  blockItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockRow: {
    flexDirection: 'row',
  },
  blockPiece: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
  },
  draggedBlock: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#444444',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hintButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#000',
    fontWeight: 'bold',
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
  gameOverText: {
    color: '#FF0000',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScoreText: {
    color: '#FFFFFF',
    fontSize: 24,
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