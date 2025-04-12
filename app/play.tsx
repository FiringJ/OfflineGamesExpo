import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { GameProvider } from '../context/GameContext';
import ColorBlocksGame from '../games/color-blocks/ColorBlocksGame';

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const gameId = parseInt(id as string) || 1; // 默认为COLOR BLOCKS游戏

  // 获取游戏标题
  const getGameTitle = (id: number) => {
    switch (id) {
      case 1: return 'COLOR BLOCKS';
      default: return '游戏';
    }
  };

  // 渲染游戏内容
  const renderGame = () => {
    switch (gameId) {
      case 1:
        return <ColorBlocksGame />;
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