import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme, IconButton } from 'react-native-paper';
import { gameColors } from '../../utils/theme';
import { useGameContext } from '../../context/GameContext';
import { Audio } from 'expo-av';

// 游戏ID
const GAME_ID = 3;

// 获取屏幕尺寸
const { width } = Dimensions.get('window');

// 游戏难度配置
const DIFFICULTY = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 30 },
  hard: { rows: 16, cols: 16, mines: 60 },
};

// 单元格状态
type CellStatus = 'hidden' | 'revealed' | 'flagged';

// 单元格类型
type Cell = {
  isMine: boolean;
  status: CellStatus;
  adjacentMines: number;
};

// 坐标类型
type Position = {
  row: number;
  col: number;
};

const MinesweeperGame: React.FC = () => {
  const theme = useTheme();
  const { updateGameScore, incrementPlayCount } = useGameContext();
  const colors = gameColors.minesweeper;

  // 游戏状态
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [minesLeft, setMinesLeft] = useState<number>(DIFFICULTY.easy.mines);
  const [cellsRevealed, setCellsRevealed] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);
  const [boardSize, setBoardSize] = useState({ rows: 9, cols: 9, mines: 10 });
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 音效状态
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(null);
  const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);
  const [flagSound, setFlagSound] = useState<Audio.Sound | null>(null);
  const [explosionSound, setExplosionSound] = useState<Audio.Sound | null>(null);
  const [winSound, setWinSound] = useState<Audio.Sound | null>(null);

  // 计算单元格大小
  const CELL_SIZE = Math.min(
    Math.floor((width - 40) / boardSize.cols),
    30
  );

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

        // 加载背景音乐
        try {
          const { sound: bgMusic } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/minesweeper_theme.mp3'),
            { isLooping: true, volume: 0.4 }
          );
          setBackgroundMusic(bgMusic);
          await bgMusic.playAsync();
        } catch (err) {
          console.log('扫雷背景音乐加载失败，继续游戏但没有音乐: ', err);
        }

        // 加载点击音效
        try {
          const { sound: clickSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/click.mp3'),
            { volume: 0.7 }
          );
          setClickSound(clickSfx);
        } catch (err) {
          console.log('点击音效加载失败: ', err);
        }

        // 加载旗帜音效
        try {
          const { sound: flagSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/flag.mp3'),
            { volume: 0.7 }
          );
          setFlagSound(flagSfx);
        } catch (err) {
          console.log('旗帜音效加载失败: ', err);
        }

        // 加载爆炸音效
        try {
          const { sound: explosionSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/explosion.mp3'),
            { volume: 0.7 }
          );
          setExplosionSound(explosionSfx);
        } catch (err) {
          console.log('爆炸音效加载失败: ', err);
        }

        // 加载胜利音效
        try {
          const { sound: winSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/win.mp3'),
            { volume: 0.7 }
          );
          setWinSound(winSfx);
        } catch (err) {
          console.log('胜利音效加载失败: ', err);
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
        if (clickSound) clickSound.unloadAsync();
        if (flagSound) flagSound.unloadAsync();
        if (explosionSound) explosionSound.unloadAsync();
        if (winSound) winSound.unloadAsync();
      } catch (error) {
        console.log('音效资源清理失败: ', error);
      }
    };
  }, []);

  // 播放音效
  const playSound = async (type: 'click' | 'flag' | 'explosion' | 'win') => {
    if (isMuted) return;

    try {
      switch (type) {
        case 'click':
          if (clickSound) {
            await clickSound.stopAsync();
            await clickSound.playFromPositionAsync(0);
          }
          break;
        case 'flag':
          if (flagSound) {
            await flagSound.stopAsync();
            await flagSound.playFromPositionAsync(0);
          }
          break;
        case 'explosion':
          if (explosionSound) {
            await explosionSound.playAsync();
          }
          break;
        case 'win':
          if (winSound) {
            await winSound.playAsync();
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
    initializeGame();
    incrementPlayCount(GAME_ID);

    return () => {
      // 清理定时器
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [difficulty]);

  // 更新最佳时间
  useEffect(() => {
    if (gameStatus === 'won' && (bestTime === 0 || timer < bestTime)) {
      setBestTime(timer);
      // 将时间转换为得分（越短越好）
      const score = Math.max(1000 - timer, 0);
      updateGameScore(GAME_ID, score);
    }
  }, [gameStatus]);

  // 初始化游戏
  const initializeGame = () => {
    // 停止之前的计时器
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    // 设置游戏参数
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    setBoardSize({ rows, cols, mines });

    // 重置游戏状态
    setGameStatus('waiting');
    setMinesLeft(mines);
    setCellsRevealed(0);
    setTimer(0);

    // 创建空白游戏板
    const newBoard: Cell[][] = [];
    for (let row = 0; row < rows; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < cols; col++) {
        newRow.push({
          isMine: false,
          status: 'hidden',
          adjacentMines: 0,
        });
      }
      newBoard.push(newRow);
    }

    setBoard(newBoard);
  };

  // 生成游戏板
  const generateBoard = (firstClick: Position): Cell[][] => {
    const { rows, cols, mines } = boardSize;

    // 复制当前的空白游戏板
    const newBoard = board.map(row => [...row]);

    // 放置地雷，确保第一次点击的位置及其周围没有地雷
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);

      // 检查是否在第一次点击的附近
      const isSafe = Math.abs(randomRow - firstClick.row) > 1 ||
        Math.abs(randomCol - firstClick.col) > 1;

      // 如果该位置没有雷且不在第一次点击的附近，则放置雷
      if (!newBoard[randomRow][randomCol].isMine && isSafe) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // 计算每个单元格周围的地雷数
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          // 检查周围8个方向
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const r = row + i;
              const c = col + j;
              if (r >= 0 && r < rows && c >= 0 && c < cols && newBoard[r][c].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].adjacentMines = count;
        }
      }
    }

    return newBoard;
  };

  // 开始游戏
  const startGame = (row: number, col: number) => {
    // 生成游戏板
    const newBoard = generateBoard({ row, col });
    setBoard(newBoard);

    // 更新游戏状态
    setGameStatus('playing');

    // 开始计时
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    setTimerInterval(interval);

    // 揭示第一次点击的格子
    revealCell(newBoard, row, col);
  };

  // 揭示单元格
  const revealCell = (currentBoard: Cell[][], row: number, col: number) => {
    // 检查边界
    if (row < 0 || row >= boardSize.rows || col < 0 || col >= boardSize.cols) {
      return;
    }

    // 获取当前单元格
    const cell = currentBoard[row][col];

    // 如果已经揭示或被标记，则跳过
    if (cell.status !== 'hidden') {
      return;
    }

    // 揭示单元格
    cell.status = 'revealed';
    setCellsRevealed(prev => prev + 1);

    // 如果是地雷，游戏结束
    if (cell.isMine) {
      playSound('explosion');
      revealAllMines(currentBoard);
      setGameStatus('lost');

      // 停止计时器
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // 暂停背景音乐
      if (backgroundMusic) {
        backgroundMusic.pauseAsync();
      }

      Alert.alert('游戏结束', '很遗憾，你触发了地雷！', [
        { text: '重新开始', onPress: () => initializeGame() }
      ]);
      return;
    }

    // 播放点击音效
    playSound('click');

    // 如果周围没有地雷，递归揭示周围的单元格
    if (cell.adjacentMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(currentBoard, row + i, col + j);
        }
      }
    }

    // 检查是否胜利
    checkWinCondition(currentBoard);
  };

  // 切换标记
  const toggleFlag = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;

    const cell = board[row][col];

    // 只能标记未揭示的单元格
    if (cell.status === 'revealed') return;

    const newBoard = [...board];

    if (cell.status === 'hidden') {
      // 如果没有旗子了，不能再标记
      if (minesLeft <= 0) return;

      newBoard[row][col].status = 'flagged';
      setMinesLeft(prev => prev - 1);
      playSound('flag');
    } else {
      newBoard[row][col].status = 'hidden';
      setMinesLeft(prev => prev + 1);
      playSound('flag');
    }

    setBoard(newBoard);
  };

  // 揭示所有地雷
  const revealAllMines = (currentBoard: Cell[][]) => {
    const newBoard = [...currentBoard];

    for (let row = 0; row < boardSize.rows; row++) {
      for (let col = 0; col < boardSize.cols; col++) {
        if (newBoard[row][col].isMine) {
          newBoard[row][col].status = 'revealed';
        }
      }
    }

    setBoard(newBoard);
  };

  // 检查胜利条件
  const checkWinCondition = (currentBoard: Cell[][]) => {
    // 如果已揭示的单元格数量等于总单元格数量减去地雷数量，则胜利
    const { rows, cols, mines } = boardSize;
    const totalCells = rows * cols;

    if (cellsRevealed === totalCells - mines) {
      setGameStatus('won');

      // 标记所有未标记的地雷
      const newBoard = [...currentBoard];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newBoard[row][col].isMine && newBoard[row][col].status !== 'flagged') {
            newBoard[row][col].status = 'flagged';
          }
        }
      }
      setBoard(newBoard);
      setMinesLeft(0);

      // 停止计时器
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // 播放胜利音效
      playSound('win');

      // 暂停背景音乐
      if (backgroundMusic) {
        backgroundMusic.pauseAsync();
      }

      Alert.alert('恭喜', `你赢了！用时：${timer}秒`, [
        { text: '再来一局', onPress: () => initializeGame() }
      ]);
    }
  };

  // 处理单元格点击
  const handleCellPress = (row: number, col: number) => {
    // 如果游戏结束，不做响应
    if (gameStatus === 'won' || gameStatus === 'lost') {
      return;
    }

    // 如果是第一次点击，初始化游戏板
    if (gameStatus === 'waiting') {
      startGame(row, col);
      return;
    }

    // 如果单元格已标记，不做响应
    if (board[row][col].status === 'flagged') {
      return;
    }

    // 揭示单元格
    const newBoard = [...board];
    revealCell(newBoard, row, col);
    setBoard(newBoard);
  };

  // 修改难度
  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (gameStatus === 'playing') {
      Alert.alert(
        '确认',
        '更改难度将重新开始游戏，确定要继续吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定', onPress: () => {
              setDifficulty(newDifficulty);
            }
          }
        ]
      );
    } else {
      setDifficulty(newDifficulty);
    }
  };

  // 渲染单元格
  const renderCell = (row: number, col: number) => {
    const cell = board[row][col];
    let backgroundColor = colors.hidden;
    let content = null;

    switch (cell.status) {
      case 'revealed':
        backgroundColor = colors.revealed;
        if (cell.isMine) {
          content = (
            <View style={styles.mine} />
          );
        } else if (cell.adjacentMines > 0) {
          const numberColors = [
            'blue', 'green', 'red', 'darkblue', 'brown', 'teal', 'black', 'gray'
          ];
          content = (
            <Text style={[styles.number, { color: numberColors[cell.adjacentMines - 1] }]}>
              {cell.adjacentMines}
            </Text>
          );
        }
        break;
      case 'flagged':
        backgroundColor = colors.hidden;
        content = (
          <View style={styles.flag} />
        );
        break;
      default:
        backgroundColor = colors.hidden;
    }

    return (
      <TouchableOpacity
        key={`cell-${row}-${col}`}
        style={[
          styles.cell,
          {
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor,
          }
        ]}
        onPress={() => handleCellPress(row, col)}
        onLongPress={() => toggleFlag(row, col)}
      >
        {content}
      </TouchableOpacity>
    );
  };

  // 渲染游戏板
  const renderBoard = () => {
    const rows = [];

    for (let row = 0; row < boardSize.rows; row++) {
      const cols = [];
      for (let col = 0; col < boardSize.cols; col++) {
        cols.push(renderCell(row, col));
      }

      rows.push(
        <View key={`row-${row}`} style={styles.row}>
          {cols}
        </View>
      );
    }

    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>扫雷</Text>

      <View style={styles.controls}>
        <View style={styles.difficultyButtons}>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 'easy' && styles.selectedDifficulty
            ]}
            onPress={() => changeDifficulty('easy')}
          >
            <Text style={difficulty === 'easy' ? styles.selectedDifficultyText : styles.difficultyText}>
              简单
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 'medium' && styles.selectedDifficulty
            ]}
            onPress={() => changeDifficulty('medium')}
          >
            <Text style={difficulty === 'medium' ? styles.selectedDifficultyText : styles.difficultyText}>
              中等
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 'hard' && styles.selectedDifficulty
            ]}
            onPress={() => changeDifficulty('hard')}
          >
            <Text style={difficulty === 'hard' ? styles.selectedDifficultyText : styles.difficultyText}>
              困难
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.soundButton} onPress={toggleMute}>
          <Text style={styles.soundButtonText}>
            {isMuted ? '开启音效' : '静音'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>剩余地雷</Text>
          <Text style={styles.infoValue}>{minesLeft}</Text>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={initializeGame}
        >
          <Text style={styles.resetButtonText}>重新开始</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>时间</Text>
          <Text style={styles.infoValue}>{timer}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        {renderBoard()}
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>
          点击揭示方块，长按标记地雷
        </Text>
        <Text style={styles.instruction}>
          最佳时间: {bestTime > 0 ? `${bestTime}秒` : '无记录'}
        </Text>
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
  controls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  difficultyButtons: {
    flexDirection: 'row',
  },
  difficultyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedDifficulty: {
    backgroundColor: '#007BFF',
  },
  difficultyText: {
    fontSize: 12,
  },
  selectedDifficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  soundButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  soundButtonText: {
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  infoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    width: '30%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  boardContainer: {
    borderWidth: 2,
    borderColor: '#333',
    padding: 1,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mine: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: 'black',
  },
  flag: {
    width: '60%',
    height: '60%',
    backgroundColor: 'red',
    borderRadius: 2,
  },
  instructionContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
  },
});

export default MinesweeperGame; 