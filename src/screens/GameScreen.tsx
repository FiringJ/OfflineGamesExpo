import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGameContext } from '../context/GameContext';

// 游戏屏幕组件
const GameScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { gameData } = useGameContext();

  // 游戏列表
  const games = [
    {
      id: 1,
      title: '俄罗斯方块',
      description: '经典的方块消除游戏',
      route: 'Tetris',
      imageSource: require('../../assets/tetris.png'),
    },
    {
      id: 2,
      title: '贪吃蛇',
      description: '控制蛇吃食物并成长',
      route: 'Snake',
      imageSource: require('../../assets/snake.png'),
    },
    {
      id: 3,
      title: '扫雷',
      description: '找出所有安全的方格',
      route: 'Minesweeper',
      imageSource: require('../../assets/minesweeper.png'),
    },
    {
      id: 4,
      title: '2048',
      description: '滑动合并数字方块',
      route: 'Game2048',
      imageSource: require('../../assets/2048.png'),
    },
  ];

  // 导航到游戏屏幕
  const navigateToGame = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        离线游戏集合
      </Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {games.map((game) => {
          // 获取该游戏的最高分
          const highScore = gameData[game.id]?.highScore || 0;

          return (
            <Card
              key={game.id}
              style={styles.card}
              mode="elevated"
            >
              <Card.Cover source={game.imageSource} style={styles.cardImage} />
              <Card.Title
                title={game.title}
                subtitle={game.description}
                titleStyle={{ fontWeight: 'bold' }}
              />
              <Card.Content>
                <View style={styles.scoreContainer}>
                  <Text variant="bodyMedium">最高分: </Text>
                  <Text variant="bodyMedium" style={styles.scoreText}>
                    {highScore}
                  </Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() => navigateToGame(game.route as keyof RootStackParamList)}
                  style={styles.playButton}
                >
                  开始游戏
                </Button>
              </Card.Actions>
            </Card>
          );
        })}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 180,
  },
  scoreContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  playButton: {
    marginLeft: 'auto',
  },
});

export default GameScreen; 