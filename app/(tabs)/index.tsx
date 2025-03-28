import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider } from '../../src/context/GameContext';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <GameProvider>
      <View style={styles.container}>
        <Text style={styles.title}>离线游戏集合</Text>

        {/* 欢迎卡片 */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.welcomeTitle}>
              欢迎回来!
            </Text>
            <Text variant="bodyMedium">
              选择一个游戏开始您的休闲时光。无需网络连接，随时随地都能玩!
            </Text>
          </Card.Content>
        </Card>

        {/* 游戏卡片 */}
        <View style={styles.gamesGrid}>
          <Card
            style={styles.gameCard}
            mode="elevated"
            onPress={() => router.push('/games?id=4')}
          >
            <Card.Cover source={require('../../assets/2048.png')} style={styles.gameImage} />
            <Card.Title
              title="2048"
              titleStyle={styles.gameTitle}
            />
          </Card>

          <Card
            style={styles.gameCard}
            mode="elevated"
            onPress={() => router.push('/games?id=1')}
          >
            <Card.Cover source={require('../../assets/tetris.png')} style={styles.gameImage} />
            <Card.Title
              title="俄罗斯方块"
              titleStyle={styles.gameTitle}
            />
          </Card>

          <Card
            style={styles.gameCard}
            mode="elevated"
            onPress={() => router.push('/games?id=2')}
          >
            <Card.Cover source={require('../../assets/snake.png')} style={styles.gameImage} />
            <Card.Title
              title="贪吃蛇"
              titleStyle={styles.gameTitle}
            />
          </Card>

          <Card
            style={styles.gameCard}
            mode="elevated"
            onPress={() => router.push('/games?id=3')}
          >
            <Card.Cover source={require('../../assets/minesweeper.png')} style={styles.gameImage} />
            <Card.Title
              title="扫雷"
              titleStyle={styles.gameTitle}
            />
          </Card>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push('/explore')}
          style={styles.exploreButton}
        >
          浏览所有游戏
        </Button>
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 40,
    color: '#333',
  },
  welcomeCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gameCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gameImage: {
    height: 120,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 'auto',
    marginBottom: 20,
  }
});
