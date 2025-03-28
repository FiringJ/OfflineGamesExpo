import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGameContext } from '../context/GameContext';

// 主页面组件
const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { gameData } = useGameContext();

  // 找出最高分的游戏
  const getTopGame = () => {
    let topGameId = 0;
    let topScore = 0;

    Object.entries(gameData).forEach(([id, data]) => {
      if (data.highScore > topScore) {
        topScore = data.highScore;
        topGameId = Number(id);
      }
    });

    return { gameId: topGameId, score: topScore };
  };

  // 获取最常玩的游戏
  const getMostPlayedGame = () => {
    let topGameId = 0;
    let topPlayCount = 0;

    Object.entries(gameData).forEach(([id, data]) => {
      if (data.playCount > topPlayCount) {
        topPlayCount = data.playCount;
        topGameId = Number(id);
      }
    });

    return { gameId: topGameId, playCount: topPlayCount };
  };

  // 游戏名称映射
  const gameNames: Record<number, string> = {
    1: '俄罗斯方块',
    2: '贪吃蛇',
    3: '扫雷',
    4: '2048',
  };

  // 游戏路由映射
  const gameRoutes: Record<number, keyof RootStackParamList> = {
    1: 'Tetris',
    2: 'Snake',
    3: 'Minesweeper',
    4: 'Game2048',
  };

  // 导航到游戏屏幕
  const navigateToGame = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
  };

  // 导航到游戏列表
  const navigateToGames = () => {
    navigation.navigate('Games');
  };

  // 获取顶部游戏数据
  const topGame = getTopGame();
  const mostPlayedGame = getMostPlayedGame();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        离线游戏集合
      </Text>

      <ScrollView style={styles.scrollView}>
        {/* 欢迎卡片 */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.welcomeTitle}>
              欢迎回来!
            </Text>
            <Text variant="bodyMedium">
              选择一个游戏开始您的休闲时光。无需网络连接，随时随地都能玩!
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={navigateToGames}>
              浏览游戏
            </Button>
          </Card.Actions>
        </Card>

        {/* 游戏推荐 */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          推荐游戏
        </Text>

        <Card style={styles.featuredCard} mode="elevated">
          <Card.Cover source={require('../../assets/2048.png')} style={styles.featuredImage} />
          <Card.Title
            title="2048"
            subtitle="滑动合并数字方块，挑战更高分数"
            titleStyle={{ fontWeight: 'bold' }}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              2048是一款简单而上瘾的解谜游戏。通过滑动合并相同的数字方块，最终目标是创建一个2048的方块。
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigateToGame('Game2048')}
              style={{ marginTop: 8 }}
            >
              开始游戏
            </Button>
          </Card.Actions>
        </Card>

        {/* 游戏统计 */}
        {(topGame.gameId > 0 || mostPlayedGame.gameId > 0) && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              游戏统计
            </Text>

            <View style={styles.statsContainer}>
              {topGame.gameId > 0 && (
                <Card style={styles.statCard}>
                  <Card.Content>
                    <Text variant="titleMedium">最高分游戏</Text>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {gameNames[topGame.gameId]}
                    </Text>
                    <Text variant="bodyMedium">
                      分数: {topGame.score}
                    </Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="outlined"
                      onPress={() => navigateToGame(gameRoutes[topGame.gameId])}
                    >
                      挑战
                    </Button>
                  </Card.Actions>
                </Card>
              )}

              {mostPlayedGame.gameId > 0 && (
                <Card style={styles.statCard}>
                  <Card.Content>
                    <Text variant="titleMedium">最常玩游戏</Text>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {gameNames[mostPlayedGame.gameId]}
                    </Text>
                    <Text variant="bodyMedium">
                      游玩次数: {mostPlayedGame.playCount}
                    </Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="outlined"
                      onPress={() => navigateToGame(gameRoutes[mostPlayedGame.gameId])}
                    >
                      开始
                    </Button>
                  </Card.Actions>
                </Card>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  featuredCard: {
    marginBottom: 20,
  },
  featuredImage: {
    height: 180,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
});

export default HomeScreen; 