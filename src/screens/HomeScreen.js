import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Paragraph, Button, Divider, Avatar } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  // 模拟数据
  const featuredGames = [
    { id: 1, title: '俄罗斯方块', description: '经典方块游戏', image: 'tetris' },
    { id: 2, title: '贪吃蛇', description: '控制蛇吃食物的游戏', image: 'snake' },
    { id: 3, title: '扫雷', description: '经典的扫雷游戏', image: 'minesweeper' },
  ];

  const recentGames = [
    { id: 1, title: '俄罗斯方块', lastPlayed: '今天' },
    { id: 3, title: '扫雷', lastPlayed: '昨天' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.sectionTitle}>推荐游戏</Title>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredGamesContainer}
      >
        {featuredGames.map(game => (
          <Card
            key={game.id}
            style={styles.featuredGameCard}
            onPress={() => navigation.navigate('GameDetails', { id: game.id, title: game.title })}
          >
            <Card.Cover source={{ uri: `https://via.placeholder.com/300x180?text=${game.image}` }} />
            <Card.Title title={game.title} />
            <Card.Content>
              <Paragraph>{game.description}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button>开始游戏</Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>最近玩过</Title>
      {recentGames.map(game => (
        <Card
          key={game.id}
          style={styles.recentGameCard}
          onPress={() => navigation.navigate('GameDetails', { id: game.id, title: game.title })}
        >
          <Card.Title
            title={game.title}
            subtitle={`上次游玩: ${game.lastPlayed}`}
            left={(props) => <Avatar.Icon {...props} icon="gamepad-variant" />}
          />
          <Card.Actions>
            <Button>继续游戏</Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuredGamesContainer: {
    paddingRight: 16,
  },
  featuredGameCard: {
    width: 280,
    marginRight: 16,
    marginBottom: 16,
  },
  recentGameCard: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
  },
});

export default HomeScreen; 