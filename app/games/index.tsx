import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GameProvider } from '../../src/context/GameContext';
import Game2048Component from '../../src/games/2048/Game2048';
import TetrisGame from '../../src/games/tetris/TetrisGame';
import SnakeGame from '../../src/games/snake/SnakeGame';
import MinesweeperGame from '../../src/games/minesweeper/MinesweeperGame';

export default function GameScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const gameId = parseInt(id as string) || 4; // 默认为2048游戏

  // 获取游戏标题
  const getGameTitle = (id: number) => {
    switch (id) {
      case 1: return '俄罗斯方块';
      case 2: return '贪吃蛇';
      case 3: return '扫雷';
      case 4: return '2048';
      default: return '游戏';
    }
  };

  // 渲染游戏内容
  const renderGame = () => {
    switch (gameId) {
      case 1:
        return <TetrisGame />;
      case 2:
        return <SnakeGame />;
      case 3:
        return <MinesweeperGame />;
      case 4:
        return <Game2048Component />;
      default:
        // 暂未实现的游戏显示敬请期待
        return (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>敬请期待</Text>
          </View>
        );
    }
  };

  return (
    <GameProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Text style={styles.title}>{getGameTitle(gameId)}</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.gameContainer}>
          {renderGame()}
        </View>
      </SafeAreaView>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.5,
  }
}); 