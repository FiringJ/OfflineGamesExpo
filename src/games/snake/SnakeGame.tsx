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
const GAME_ID = 2;

// 获取屏幕尺寸
const { width } = Dimensions.get('window');
const GRID_SIZE = 15;
const CELL_SIZE = Math.floor((width - 40) / GRID_SIZE);

// 方向枚举
enum Direction {
  Up,
  Right,
  Down,
  Left,
}

// 坐标类型
type Position = {
  x: number;
  y: number;
};

// 游戏组件
const SnakeGame: React.FC = () => {
  const theme = useTheme();
  const { updateGameScore, incrementPlayCount } = useGameContext();
  const colors = gameColors.snake;

  // 游戏状态
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [speed, setSpeed] = useState<number>(200);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 音效
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(null);
  const [eatSound, setEatSound] = useState<Audio.Sound | null>(null);
  const [gameOverSound, setGameOverSound] = useState<Audio.Sound | null>(null);

  // 游戏循环定时器
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

        // 加载背景音乐
        try {
          const { sound: bgMusic } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/snake_theme.mp3'),
            { isLooping: true, volume: 0.4 }
          );
          setBackgroundMusic(bgMusic);
          await bgMusic.playAsync();
        } catch (err) {
          console.log('贪吃蛇背景音乐加载失败，继续游戏但没有音乐: ', err);
        }

        // 加载吃食物音效
        try {
          const { sound: eatSfx } = await Audio.Sound.createAsync(
            require('../../../assets/sounds/eat.mp3'),
            { volume: 0.7 }
          );
          setEatSound(eatSfx);
        } catch (err) {
          console.log('吃食物音效加载失败: ', err);
        }

        // 加载游戏结束音效
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
        if (eatSound) eatSound.unloadAsync();
        if (gameOverSound) gameOverSound.unloadAsync();
      } catch (error) {
        console.log('音效资源清理失败: ', error);
      }
    };
  }, []);

  // 播放音效
  const playSound = async (type: 'eat' | 'gameOver') => {
    if (isMuted) return;

    try {
      switch (type) {
        case 'eat':
          if (eatSound) {
            await eatSound.stopAsync();
            await eatSound.playFromPositionAsync(0);
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

  // 初始化游戏
  useEffect(() => {
    incrementPlayCount(GAME_ID);

    return () => {
      // 清理游戏循环
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
    // 初始化游戏状态
    setSnake([{ x: 7, y: 7 }]);
    setDirection(Direction.Right);
    setScore(0);
    setIsPlaying(true);
    setIsPaused(false);
    generateFood();

    // 清除现有的游戏循环
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    // 启动游戏循环
    gameLoopRef.current = setInterval(() => gameLoop(), speed);

    // 播放背景音乐
    if (backgroundMusic && !isMuted) {
      backgroundMusic.playAsync();
    }
  };

  // 暂停/恢复游戏
  const togglePause = () => {
    if (!isPlaying) return;

    setIsPaused(!isPaused);
    if (isPaused) {
      // 恢复游戏循环
      gameLoopRef.current = setInterval(() => gameLoop(), speed);
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

  // 生成食物
  const generateFood = () => {
    let newFood: Position;
    let foodOnSnake: boolean;

    do {
      foodOnSnake = false;
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

      // 检查是否与蛇身重叠
      for (const segment of snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          foodOnSnake = true;
          break;
        }
      }
    } while (foodOnSnake);

    setFood(newFood);
  };

  // 游戏主循环
  const gameLoop = () => {
    if (isPaused || !isPlaying) return;

    moveSnake();
  };

  // 移动蛇
  const moveSnake = () => {
    const head = { ...snake[0] };
    const newSnake = [...snake];

    // 根据方向移动蛇头
    switch (direction) {
      case Direction.Up:
        head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case Direction.Right:
        head.x = (head.x + 1) % GRID_SIZE;
        break;
      case Direction.Down:
        head.y = (head.y + 1) % GRID_SIZE;
        break;
      case Direction.Left:
        head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
        break;
    }

    // 检查是否撞到自己
    for (let i = 1; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        gameOver();
        return;
      }
    }

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 吃到食物，增加长度但不删除尾部
      playSound('eat');
      setScore(prevScore => prevScore + 10);
      generateFood();

      // 每增加50分提高速度
      if (score > 0 && score % 50 === 0) {
        const newSpeed = Math.max(50, speed - 20);
        setSpeed(newSpeed);

        // 重新设置游戏循环速度
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = setInterval(() => gameLoop(), newSpeed);
        }
      }
    } else {
      // 没吃到食物，删除尾部
      newSnake.pop();
    }

    // 添加新的蛇头
    newSnake.unshift(head);
    setSnake(newSnake);
  };

  // 游戏结束
  const gameOver = () => {
    setIsPlaying(false);

    // 停止游戏循环
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
  };

  // 修改方向
  const changeDirection = (newDirection: Direction) => {
    if (!isPlaying || isPaused) return;

    // 防止180度转向
    if (
      (direction === Direction.Up && newDirection === Direction.Down) ||
      (direction === Direction.Down && newDirection === Direction.Up) ||
      (direction === Direction.Left && newDirection === Direction.Right) ||
      (direction === Direction.Right && newDirection === Direction.Left)
    ) {
      return;
    }

    setDirection(newDirection);
  };

  // 渲染游戏网格
  const renderGrid = () => {
    const grid = [];

    // 渲染食物
    grid.push(
      <View
        key="food"
        style={[
          styles.cell,
          {
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: colors.food,
            borderRadius: CELL_SIZE / 2, // 圆形食物
          }
        ]}
      />
    );

    // 渲染蛇
    snake.forEach((segment, index) => {
      let backgroundColor = colors.snake;
      let borderRadius = 0;

      // 蛇头与身体不同颜色
      if (index === 0) {
        backgroundColor = colors.snakeHead;

        // 根据方向设置蛇头形状
        if (direction === Direction.Up || direction === Direction.Down) {
          borderRadius = CELL_SIZE / 3;
        } else {
          borderRadius = CELL_SIZE / 3;
        }
      }

      grid.push(
        <View
          key={`snake-${index}`}
          style={[
            styles.cell,
            {
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor,
              borderRadius,
            }
          ]}
        />
      );
    });

    return grid;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>贪吃蛇</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>得分</Text>
          <Text style={styles.infoValue}>{score}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>最高分</Text>
          <Text style={styles.infoValue}>{bestScore}</Text>
        </View>
      </View>

      <View
        style={[
          styles.gameBoard,
          {
            width: CELL_SIZE * GRID_SIZE,
            height: CELL_SIZE * GRID_SIZE,
            backgroundColor: colors.background,
          }
        ]}
      >
        {renderGrid()}
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.directionControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.upButton]}
            onPress={() => changeDirection(Direction.Up)}
          >
            <Text style={styles.controlText}>↑</Text>
          </TouchableOpacity>

          <View style={styles.middleControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.leftButton]}
              onPress={() => changeDirection(Direction.Left)}
            >
              <Text style={styles.controlText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.rightButton]}
              onPress={() => changeDirection(Direction.Right)}
            >
              <Text style={styles.controlText}>→</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.controlButton, styles.downButton]}
            onPress={() => changeDirection(Direction.Down)}
          >
            <Text style={styles.controlText}>↓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gameControls}>
          <TouchableOpacity
            style={[styles.gameButton, { backgroundColor: isPlaying ? '#dc3545' : '#28a745' }]}
            onPress={isPlaying ? togglePause : startGame}
          >
            <Text style={styles.gameButtonText}>
              {!isPlaying ? '开始游戏' : isPaused ? '继续' : '暂停'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameButton, { backgroundColor: '#007bff' }]}
            onPress={toggleMute}
          >
            <Text style={styles.gameButtonText}>
              {isMuted ? '开启音效' : '静音'}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  infoBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '45%',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameBoard: {
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    marginVertical: 15,
  },
  cell: {
    position: 'absolute',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  directionControls: {
    alignItems: 'center',
    marginBottom: 15,
  },
  middleControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150,
    marginVertical: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 30,
  },
  upButton: {
    marginBottom: 10,
  },
  downButton: {
    marginTop: 10,
  },
  leftButton: {},
  rightButton: {},
  controlText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  gameButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  gameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SnakeGame; 