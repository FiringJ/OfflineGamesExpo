import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { gameColors } from '../../utils/theme';
import { useGameContext } from '../../context/GameContext';
import { Audio } from 'expo-av';

// 游戏ID
const GAME_ID = 1;

// 获取屏幕尺寸
const { width } = Dimensions.get('window');
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = Math.floor((width - 40) / BOARD_WIDTH);

// 方块形状
const SHAPES = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  // L
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  // O
  [
    [4, 4],
    [4, 4]
  ],
  // S
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  // T
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  // Z
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
];

const TetrisGame: React.FC = () => {
  const theme = useTheme();
  const { updateGameScore, incrementPlayCount } = useGameContext();
  const colors = gameColors.tetris;

  // 游戏状态
  const [board, setBoard] = useState<number[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [linesCleared, setLinesCleared] = useState(0);

  // 音效
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(null);
  const [moveSound, setMoveSound] = useState<Audio.Sound | null>(null);
  const [clearSound, setClearSound] = useState<Audio.Sound | null>(null);
  const [rotateSound, setRotateSound] = useState<Audio.Sound | null>(null);
  const [gameOverSound, setGameOverSound] = useState<Audio.Sound | null>(null);

  // 定时器引用
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化音效
  useEffect(() => {
    async function loadSounds() {
      try {
        // 初始化音频模式
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // 加载音效
        try {
          const { sound: bgMusic } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/tetris_theme.mp3'),
            { isLooping: true, volume: 0.4 }
          );
          setBackgroundMusic(bgMusic);
          // 播放背景音乐
          await bgMusic.playAsync();
        } catch (err) {
          console.log('俄罗斯方块背景音乐加载失败，继续游戏但没有音乐: ', err);
        }

        try {
          const { sound: moveSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/move.mp3'),
            { volume: 0.6 }
          );
          setMoveSound(moveSfx);
        } catch (err) {
          console.log('移动音效加载失败: ', err);
        }

        try {
          const { sound: clearSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/clear.mp3'),
            { volume: 0.7 }
          );
          setClearSound(clearSfx);
        } catch (err) {
          console.log('消行音效加载失败: ', err);
        }

        try {
          const { sound: rotateSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/rotate.mp3'),
            { volume: 0.6 }
          );
          setRotateSound(rotateSfx);
        } catch (err) {
          console.log('旋转音效加载失败: ', err);
        }

        try {
          const { sound: gameOverSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/gameover.mp3'),
            { volume: 0.7 }
          );
          setGameOverSound(gameOverSfx);
        } catch (err) {
          console.log('游戏结束音效加载失败: ', err);
        }
      } catch (error) {
        console.log('音频系统初始化失败，游戏将继续但没有音效: ', error);
      }
    }

    loadSounds();

    // 清理音效
    return () => {
      try {
        if (backgroundMusic) backgroundMusic.unloadAsync();
        if (moveSound) moveSound.unloadAsync();
        if (clearSound) clearSound.unloadAsync();
        if (rotateSound) rotateSound.unloadAsync();
        if (gameOverSound) gameOverSound.unloadAsync();
      } catch (error) {
        console.log('音效资源清理失败: ', error);
      }
    };
  }, []);

  // 播放音效
  const playSound = async (type: 'move' | 'clear' | 'rotate' | 'gameOver') => {
    if (isMuted) return;

    try {
      switch (type) {
        case 'move':
          if (moveSound) {
            await moveSound.stopAsync();
            await moveSound.playFromPositionAsync(0);
          }
          break;
        case 'clear':
          if (clearSound) {
            await clearSound.stopAsync();
            await clearSound.playFromPositionAsync(0);
          }
          break;
        case 'rotate':
          if (rotateSound) {
            await rotateSound.stopAsync();
            await rotateSound.playFromPositionAsync(0);
          }
          break;
        case 'gameOver':
          if (gameOverSound) {
            await gameOverSound.playAsync();
          }
          break;
      }
    } catch (error) {
      console.log(`播放${type}音效失败，但游戏继续:`, error);
    }
  };

  // 切换音效
  const toggleMute = async () => {
    try {
      if (backgroundMusic) {
        if (isMuted) {
          await backgroundMusic.playAsync();
        } else {
          await backgroundMusic.pauseAsync();
        }
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.log('静音切换失败，直接更新静音状态:', error);
      setIsMuted(!isMuted); // 即使出错也更新UI状态
    }
  };

  // 游戏初始化
  useEffect(() => {
    startGame();
    incrementPlayCount(GAME_ID);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      // 保存最高分
      updateGameScore(GAME_ID, bestScore);
    };
  }, []);

  // 更新最高分
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      updateGameScore(GAME_ID, score);
    }
  }, [score]);

  // 开始游戏
  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    spawnNewPiece();

    // 清除现有的游戏循环
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    // 启动游戏循环
    gameLoopRef.current = setInterval(() => gameLoop(), 1000 - (level - 1) * 100);
  };

  // 暂停/恢复游戏
  const togglePause = () => {
    if (gameOver) return;

    setIsPaused(!isPaused);
    if (isPaused) {
      // 恢复游戏循环
      gameLoopRef.current = setInterval(() => gameLoop(), 1000 - (level - 1) * 100);
      // 恢复背景音乐
      if (backgroundMusic && !isMuted) {
        backgroundMusic.playAsync();
      }
    } else {
      // 暂停游戏循环
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      // 暂停背景音乐
      if (backgroundMusic) {
        backgroundMusic.pauseAsync();
      }
    }
  };

  // 生成新方块
  const spawnNewPiece = () => {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    const newPiece = SHAPES[randomIndex];
    const startX = Math.floor((BOARD_WIDTH - newPiece[0].length) / 2);

    setCurrentPiece(newPiece);
    setCurrentPosition({ x: startX, y: 0 });

    // 检查游戏是否结束
    if (!canMoveTo(newPiece, { x: startX, y: 0 })) {
      setGameOver(true);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }

      // 播放游戏结束音效
      playSound('gameOver');

      // 暂停背景音乐
      if (backgroundMusic) {
        backgroundMusic.pauseAsync();
      }

      Alert.alert(
        '游戏结束',
        `您的得分: ${score}`,
        [
          {
            text: '重新开始',
            onPress: () => startGame(),
          }
        ]
      );
    }
  };

  // 游戏主循环
  const gameLoop = () => {
    if (isPaused || gameOver) return;

    moveDown();
  };

  // 检查是否可以移动到指定位置
  const canMoveTo = (piece: number[][], position: { x: number, y: number }): boolean => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0) {
          const newX = position.x + col;
          const newY = position.y + row;

          // 检查是否超出边界
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }

          // 检查是否与已有方块重叠
          if (newY >= 0 && board[newY][newX] !== 0) {
            return false;
          }
        }
      }
    }

    return true;
  };

  // 将当前方块锁定到游戏板
  const lockPiece = () => {
    const newBoard = [...board];

    for (let row = 0; row < currentPiece.length; row++) {
      for (let col = 0; col < currentPiece[row].length; col++) {
        if (currentPiece[row][col] !== 0) {
          const boardRow = currentPosition.y + row;
          const boardCol = currentPosition.x + col;

          if (boardRow >= 0) {
            newBoard[boardRow][boardCol] = currentPiece[row][col];
          }
        }
      }
    }

    setBoard(newBoard);

    // 检查是否有完整的行
    clearLines(newBoard);

    // 生成新方块
    spawnNewPiece();
  };

  // 清除完整的行
  const clearLines = (board: number[][]) => {
    let linesCount = 0;
    const newBoard = [...board];

    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== 0)) {
        // 行已满
        linesCount++;

        // 将上面的行下移
        for (let r = row; r > 0; r--) {
          newBoard[r] = [...newBoard[r - 1]];
        }

        // 顶部添加新的空行
        newBoard[0] = Array(BOARD_WIDTH).fill(0);

        // 重新检查同一行
        row++;
      }
    }

    if (linesCount > 0) {
      // 播放清除音效
      playSound('clear');

      // 更新分数与级别
      const points = calculatePoints(linesCount, level);
      const newScore = score + points;
      const newLinesCleared = linesCleared + linesCount;
      const newLevel = Math.floor(newLinesCleared / 10) + 1;

      setScore(newScore);
      setLinesCleared(newLinesCleared);

      // 更新游戏级别和速度
      if (newLevel > level) {
        setLevel(newLevel);

        // 更新游戏速度
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = setInterval(() => gameLoop(), 1000 - (newLevel - 1) * 100);
        }
      }

      setBoard(newBoard);
    }
  };

  // 计算得分
  const calculatePoints = (lines: number, level: number): number => {
    const basePoints = [0, 40, 100, 300, 1200];
    return basePoints[lines] * level;
  };

  // 移动方向
  const moveLeft = () => {
    if (isPaused || gameOver) return;

    const newPosition = { ...currentPosition, x: currentPosition.x - 1 };
    if (canMoveTo(currentPiece, newPosition)) {
      setCurrentPosition(newPosition);
      playSound('move');
    }
  };

  const moveRight = () => {
    if (isPaused || gameOver) return;

    const newPosition = { ...currentPosition, x: currentPosition.x + 1 };
    if (canMoveTo(currentPiece, newPosition)) {
      setCurrentPosition(newPosition);
      playSound('move');
    }
  };

  const moveDown = () => {
    if (isPaused || gameOver) return;

    const newPosition = { ...currentPosition, y: currentPosition.y + 1 };
    if (canMoveTo(currentPiece, newPosition)) {
      setCurrentPosition(newPosition);
    } else {
      // 无法下落，锁定方块
      lockPiece();
    }
  };

  const hardDrop = () => {
    if (isPaused || gameOver) return;

    let dropDistance = 0;
    let newY = currentPosition.y;

    // 找到可下落的最大距离
    while (canMoveTo(currentPiece, { x: currentPosition.x, y: newY + 1 })) {
      newY++;
      dropDistance++;
    }

    if (dropDistance > 0) {
      // 增加分数
      setScore(score + dropDistance);
      setCurrentPosition({ ...currentPosition, y: newY });
      lockPiece();
      playSound('move');
    }
  };

  // 旋转方块
  const rotatePiece = () => {
    if (isPaused || gameOver) return;

    const rotated = rotateMatrix(currentPiece);
    if (canMoveTo(rotated, currentPosition)) {
      setCurrentPiece(rotated);
      playSound('rotate');
    } else {
      // 尝试墙踢 (wall kick) - 看看在旋转时是否可以向左或向右移动一步
      if (canMoveTo(rotated, { ...currentPosition, x: currentPosition.x - 1 })) {
        setCurrentPiece(rotated);
        setCurrentPosition({ ...currentPosition, x: currentPosition.x - 1 });
        playSound('rotate');
      } else if (canMoveTo(rotated, { ...currentPosition, x: currentPosition.x + 1 })) {
        setCurrentPiece(rotated);
        setCurrentPosition({ ...currentPosition, x: currentPosition.x + 1 });
        playSound('rotate');
      }
    }
  };

  // 旋转矩阵
  const rotateMatrix = (matrix: number[][]): number[][] => {
    const N = matrix.length;
    const rotated = Array(N).fill(null).map(() => Array(N).fill(0));

    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        rotated[col][N - 1 - row] = matrix[row][col];
      }
    }

    return rotated;
  };

  // 渲染游戏板
  const renderBoard = () => {
    const cells = [];

    // 渲染游戏板
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const cellColor = board[row][col] !== 0
          ? colors[`block${board[row][col]}` as keyof typeof colors] || colors.block1
          : colors.empty;

        cells.push(
          <View
            key={`cell-${row}-${col}`}
            style={[
              styles.cell,
              {
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: cellColor,
                top: row * BLOCK_SIZE,
                left: col * BLOCK_SIZE
              }
            ]}
          />
        );
      }
    }

    // 渲染当前方块
    for (let row = 0; row < currentPiece.length; row++) {
      for (let col = 0; col < currentPiece[row].length; col++) {
        if (currentPiece[row][col] !== 0) {
          const boardRow = currentPosition.y + row;
          const boardCol = currentPosition.x + col;

          // 只渲染在游戏板内的部分
          if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
            const cellColor = colors[`block${currentPiece[row][col]}` as keyof typeof colors] || colors.block1;

            cells.push(
              <View
                key={`piece-${row}-${col}`}
                style={[
                  styles.cell,
                  {
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: cellColor,
                    top: boardRow * BLOCK_SIZE,
                    left: boardCol * BLOCK_SIZE
                  }
                ]}
              />
            );
          }
        }
      }
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>俄罗斯方块</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>得分</Text>
          <Text style={styles.infoValue}>{score}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>最高分</Text>
          <Text style={styles.infoValue}>{bestScore}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>等级</Text>
          <Text style={styles.infoValue}>{level}</Text>
        </View>
      </View>

      <View style={[styles.boardContainer, { width: BLOCK_SIZE * BOARD_WIDTH, height: BLOCK_SIZE * BOARD_HEIGHT }]}>
        {renderBoard()}
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
            <Text style={styles.controlText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={hardDrop}>
            <Text style={styles.controlText}>⬇</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
            <Text style={styles.controlText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={rotatePiece}>
            <Text style={styles.controlText}>旋转</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
            <Text style={styles.controlText}>{isPaused ? '继续' : '暂停'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <Text style={styles.controlText}>{isMuted ? '开启音效' : '静音'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newGameButton} onPress={startGame}>
          <Text style={styles.newGameText}>新游戏</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  infoBox: {
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '30%',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  boardContainer: {
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    marginVertical: 10,
  },
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  controlsContainer: {
    width: '100%',
    marginTop: 10,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  newGameText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TetrisGame; 