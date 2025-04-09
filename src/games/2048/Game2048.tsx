import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderInstance,
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { gameColors } from '../../utils/theme';
import { useGameContext } from '../../context/GameContext';
import { Audio } from 'expo-av';
import { useAudioManager } from '../../utils/AudioManager';
import { Ionicons } from '@expo/vector-icons';

// 游戏ID
const GAME_ID = 4;

// 方向枚举
enum Direction {
  Up,
  Right,
  Down,
  Left,
}

// 方块类型
type Tile = {
  value: number;
  id: number;
  mergedFrom?: [Tile, Tile] | null;
};

// 位置类型
type Position = {
  x: number;
  y: number;
};

// 游戏常量
const BOARD_SIZE = 4;
const CELL_SIZE = 70; // 调整方块大小
const CELL_MARGIN = 8;

// 获取屏幕尺寸以确保游戏界面适应不同设备
const windowWidth = Dimensions.get('window').width;

// 游戏组件
const Game2048: React.FC = () => {
  const theme = useTheme();
  const { updateGameScore, incrementPlayCount } = useGameContext();

  // 游戏状态
  const [board, setBoard] = useState<(Tile | null)[][]>(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [continueAfterWin, setContinueAfterWin] = useState<boolean>(false);
  const [tileIdCounter, setTileIdCounter] = useState<number>(0);

  // 使用AudioManager处理音频
  const audioManager = useAudioManager({
    sounds: {
      // background: require('../../../assets/sounds/background.wav'),
      // move: require('../../../assets/sounds/move.wav'),
      // merge: require('../../../assets/sounds/merge.wav')
    },
    options: {
      background: { isLooping: true, volume: 0.4 },
      move: { volume: 0.6 },
      merge: { volume: 0.7 }
    },
    autoPlayBackground: 'background'
  });

  // 用于动画的状态
  const animationRef = useRef(new Animated.Value(1)).current;

  // 游戏颜色
  const colors = gameColors.game2048;

  // 初始化游戏
  useEffect(() => {
    startNewGame();
    // 游戏开始时增加游玩次数
    incrementPlayCount(GAME_ID);

    return () => {
      // 离开时更新最高分
      updateGameScore(GAME_ID, score);
    };
  }, []);

  // 分数变更时更新最高分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      // 更新游戏上下文中的分数
      updateGameScore(GAME_ID, score);
    }
  }, [score]);

  // 初始化游戏板
  const initializeBoard = (): void => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    setBoard(newBoard);

    // 添加初始方块
    addRandomTile(newBoard);
    addRandomTile(newBoard);
  };

  // 开始新游戏
  const startNewGame = (): void => {
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setContinueAfterWin(false);
    setTileIdCounter(0);
    initializeBoard();
  };

  // 生成新的方块ID
  const getNextTileId = (): number => {
    const nextId = tileIdCounter;
    setTileIdCounter(prev => prev + 1);
    return nextId;
  };

  // 添加随机方块
  const addRandomTile = (currentBoard: (Tile | null)[][]): void => {
    // 找出所有空位置
    const emptyCells: Position[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (!currentBoard[x][y]) {
          emptyCells.push({ x, y });
        }
      }
    }

    // 如果有空位置，随机选择一个
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      // 90%概率生成2，10%概率生成4
      const value = Math.random() < 0.9 ? 2 : 4;

      // 创建新方块
      const newTile: Tile = {
        value,
        id: getNextTileId(),
      };

      // 更新游戏板
      currentBoard[randomCell.x][randomCell.y] = newTile;
      setBoard([...currentBoard]);
    }
  };

  // 检查游戏是否结束
  const checkGameOver = (currentBoard: (Tile | null)[][]): boolean => {
    // 检查是否有空格
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        if (!currentBoard[x][y]) {
          return false;
        }
      }
    }

    // 检查是否有可合并的方块
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const tile = currentBoard[x][y];
        if (tile) {
          // 检查右边和下边的方块
          if (
            (x < BOARD_SIZE - 1 && currentBoard[x + 1][y]?.value === tile.value) ||
            (y < BOARD_SIZE - 1 && currentBoard[x][y + 1]?.value === tile.value)
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  // 根据方向移动方块
  const move = (direction: Direction): void => {
    // 如果游戏已结束且未选择继续，则不执行移动
    if (isGameOver || (hasWon && !continueAfterWin)) {
      return;
    }

    // 创建游戏板副本
    const boardCopy = JSON.parse(JSON.stringify(board));
    let moved = false;
    let merged = false;
    let scoreToAdd = 0;

    // 根据方向定义遍历顺序
    const buildTraversals = (direction: Direction) => {
      const traversals = { x: [] as number[], y: [] as number[] };

      for (let i = 0; i < BOARD_SIZE; i++) {
        traversals.x.push(i);
        traversals.y.push(i);
      }

      // 根据方向反转顺序
      if (direction === Direction.Right) traversals.y = traversals.y.reverse();
      if (direction === Direction.Down) traversals.x = traversals.x.reverse();

      return traversals;
    };

    // 获取下一个位置
    const getNextPosition = (pos: Position, dir: Direction): Position => {
      let { x, y } = pos;

      switch (dir) {
        case Direction.Up:
          return { x: x - 1, y };
        case Direction.Right:
          return { x, y: y + 1 };
        case Direction.Down:
          return { x: x + 1, y };
        case Direction.Left:
          return { x, y: y - 1 };
      }
    };

    // 检查位置是否在边界内
    const isWithinBounds = (pos: Position): boolean => {
      return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
    };

    // 找到给定位置和方向下的最远位置
    const findFarthestPosition = (
      board: (Tile | null)[][],
      pos: Position,
      dir: Direction
    ): { farthest: Position; next: Position | null } => {
      let farthest = pos;
      let next = getNextPosition(pos, dir);

      while (isWithinBounds(next) && !board[next.x][next.y]) {
        farthest = next;
        next = getNextPosition(next, dir);
      }

      return {
        farthest,
        next: isWithinBounds(next) ? next : null,
      };
    };

    // 移动单个方块
    const moveTile = (
      board: (Tile | null)[][],
      from: Position,
      to: Position
    ): void => {
      if (from.x === to.x && from.y === to.y) return;

      // 移动方块
      const tile = board[from.x][from.y];
      board[to.x][to.y] = tile;
      board[from.x][from.y] = null;
      moved = true;
    };

    // 合并方块
    const mergeTiles = (
      board: (Tile | null)[][],
      pos: Position,
      nextPos: Position
    ): void => {
      // 获取方块
      const tile = board[pos.x][pos.y];
      const nextTile = board[nextPos.x][nextPos.y];

      if (tile && nextTile && tile.value === nextTile.value) {
        // 创建新方块，值为两个方块的和
        const newValue = tile.value * 2;
        const mergedTile: Tile = {
          value: newValue,
          id: getNextTileId(),
          mergedFrom: [tile, nextTile],
        };

        // 更新游戏板
        board[nextPos.x][nextPos.y] = mergedTile;
        board[pos.x][pos.y] = null;

        // 更新分数
        scoreToAdd += newValue;
        merged = true;

        // 检查是否达到2048
        if (newValue === 2048 && !hasWon) {
          setHasWon(true);
          Alert.alert(
            '恭喜!',
            '你达到了2048! 继续游戏吗?',
            [
              {
                text: '继续',
                onPress: () => setContinueAfterWin(true),
              },
              {
                text: '重新开始',
                onPress: () => startNewGame(),
              },
            ]
          );
        }

        moved = true;
      }
    };

    // 执行移动
    const traversals = buildTraversals(direction);

    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const pos = { x, y };
        const tile = boardCopy[x][y];

        if (tile) {
          const { farthest, next } = findFarthestPosition(boardCopy, pos, direction);

          if (next && boardCopy[next.x][next.y]?.value === tile.value) {
            // 合并方块
            mergeTiles(boardCopy, pos, next);
          } else {
            // 移动方块
            moveTile(boardCopy, pos, farthest);
          }
        }
      });
    });

    // 如果有移动，则添加新方块并检查游戏状态
    if (moved) {
      // 播放音效
      if (merged) {
        playMergeSound();
      } else {
        playMoveSound();
      }

      // 添加随机方块
      addRandomTile(boardCopy);

      // 更新分数
      setScore(prevScore => prevScore + scoreToAdd);

      // 检查游戏是否结束
      if (checkGameOver(boardCopy)) {
        setIsGameOver(true);
        Alert.alert(
          '游戏结束',
          `最终得分: ${score + scoreToAdd}`,
          [
            {
              text: '重新开始',
              onPress: () => startNewGame(),
            },
          ]
        );
      }

      // 更新游戏板
      setBoard(boardCopy);

      // 添加板震动动画
      Animated.sequence([
        Animated.timing(animationRef, {
          toValue: 1.03,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animationRef, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // 播放移动音效
  const playMoveSound = () => {
    audioManager.playSound('move');
  };

  // 播放合并音效
  const playMergeSound = () => {
    audioManager.playSound('merge');
  };

  // 手势响应器 - 修复滑动问题
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 确保只有明显的滑动才会触发
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const minDistance = 20; // 最小滑动距离

        // 确定主要方向
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平移动
          if (Math.abs(dx) > minDistance) {
            if (dx > 0) {
              move(Direction.Right);
            } else {
              move(Direction.Left);
            }
          }
        } else {
          // 垂直移动
          if (Math.abs(dy) > minDistance) {
            if (dy > 0) {
              move(Direction.Down);
            } else {
              move(Direction.Up);
            }
          }
        }
      },
    })
  ).current;

  // 渲染方块
  const renderTile = (x: number, y: number): JSX.Element => {
    const tile = board[x][y];

    // 计算方块位置
    const positionStyle = {
      position: 'absolute' as 'absolute',
      left: y * (CELL_SIZE + CELL_MARGIN) + CELL_MARGIN,
      top: x * (CELL_SIZE + CELL_MARGIN) + CELL_MARGIN,
      width: CELL_SIZE,
      height: CELL_SIZE,
    };

    if (!tile) {
      return <View style={[styles.tile, positionStyle, { backgroundColor: colors.emptyCell }]} key={`empty-${x}-${y}`} />;
    }

    // 确定方块颜色
    const tileColor = colors[`tile${tile.value}` as keyof typeof colors] || colors.tile2048;
    const textColor = tile.value <= 4 ? colors.textDark : colors.textLight;

    // 根据数字长度调整字体大小
    const fontSize = tile.value < 100 ? 24 : tile.value < 1000 ? 20 : 16;

    return (
      <View
        style={[
          styles.tile,
          positionStyle,
          { backgroundColor: tileColor }
        ]}
        key={`tile-${tile.id}-${x}-${y}`}
      >
        <Text style={[styles.tileText, { color: textColor, fontSize }]}>
          {tile.value}
        </Text>
      </View>
    );
  };

  // 渲染所有方块
  const renderTiles = (): JSX.Element[] => {
    const tiles: JSX.Element[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        tiles.push(renderTile(x, y));
      }
    }

    return tiles;
  };

  // 渲染网格
  const renderGrid = (): JSX.Element[] => {
    const cells: JSX.Element[] = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        cells.push(
          <View
            style={[
              styles.cell,
              {
                left: y * (CELL_SIZE + CELL_MARGIN) + CELL_MARGIN,
                top: x * (CELL_SIZE + CELL_MARGIN) + CELL_MARGIN,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: colors.emptyCell,
              }
            ]}
            key={`cell-${x}-${y}`}
          />
        );
      }
    }

    return cells;
  };

  // 渲染静音按钮
  const renderMuteButton = () => {
    return (
      <TouchableOpacity style={styles.muteButton} onPress={audioManager.toggleMute}>
        <Ionicons
          name={audioManager.isMuted ? 'volume-mute' : 'volume-high'}
          size={24}
          color="#776e65"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textDark }]}>2048</Text>

      <View style={styles.header}>
        <View style={[styles.scoreBox, { backgroundColor: colors.boardBackground }]}>
          <Text style={[styles.scoreLabel, { color: colors.textLight }]}>得分</Text>
          <Text style={[styles.scoreValue, { color: colors.textLight }]}>{score}</Text>
        </View>

        <View style={[styles.scoreBox, { backgroundColor: colors.boardBackground }]}>
          <Text style={[styles.scoreLabel, { color: colors.textLight }]}>最高分</Text>
          <Text style={[styles.scoreValue, { color: colors.textLight }]}>{bestScore}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          onPress={startNewGame}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>新游戏</Text>
        </TouchableOpacity>

        {renderMuteButton()}
      </View>

      <Animated.View
        style={[
          styles.boardContainer,
          {
            backgroundColor: colors.boardBackground,
            transform: [{ scale: animationRef }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.grid}>
          {renderGrid()}
        </View>
        <View style={styles.tilesContainer}>
          {renderTiles()}
        </View>
      </Animated.View>

      <View style={styles.instructions}>
        <Text style={[styles.instructionText, { color: colors.textDark }]}>
          滑动合并相同数字的方块，尝试达到2048!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: (CELL_SIZE + CELL_MARGIN) * BOARD_SIZE + CELL_MARGIN,
    marginBottom: 10,
  },
  scoreBox: {
    width: (CELL_SIZE + CELL_MARGIN) * 2 - CELL_MARGIN,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  boardContainer: {
    position: 'relative',
    width: (CELL_SIZE + CELL_MARGIN) * BOARD_SIZE + CELL_MARGIN,
    height: (CELL_SIZE + CELL_MARGIN) * BOARD_SIZE + CELL_MARGIN,
    borderRadius: 5,
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  cell: {
    position: 'absolute',
    borderRadius: 5,
  },
  tilesContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  tile: {
    position: 'absolute',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructions: {
    marginTop: 10,
    padding: 8,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  muteButton: {
    padding: 8,
  },
});

export default Game2048; 