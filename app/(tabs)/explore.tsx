import React from 'react';
import { StyleSheet, View, Image, FlatList } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider } from '../../src/context/GameContext';

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();

  // 游戏列表
  const games = [
    {
      id: 1,
      title: '俄罗斯方块',
      description: '经典的方块消除游戏',
      image: require('../../assets/tetris.png'),
    },
    {
      id: 2,
      title: '贪吃蛇',
      description: '控制蛇吃食物并成长',
      image: require('../../assets/snake.png'),
    },
    {
      id: 3,
      title: '扫雷',
      description: '找出所有安全的方格',
      image: require('../../assets/minesweeper.png'),
    },
    {
      id: 4,
      title: '2048',
      description: '滑动合并数字方块',
      image: require('../../assets/2048.png'),
    },
  ];

  // 渲染游戏项
  const renderGameItem = ({ item }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Cover source={item.image} style={styles.cardImage} />
      <Card.Title
        title={item.title}
        subtitle={item.description}
        titleStyle={{ fontWeight: 'bold' }}
      />
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => router.push(`/games?id=${item.id}`)}
        >
          开始游戏
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <GameProvider>
      <View style={styles.container}>
        <Text style={styles.title}>游戏列表</Text>

        <FlatList
          data={games}
          renderItem={renderGameItem}
          keyExtractor={item => item.id.toString()}
          numColumns={1}
          contentContainerStyle={styles.listContent}
        />
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
  listContent: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  cardImage: {
    height: 180,
  },
});
