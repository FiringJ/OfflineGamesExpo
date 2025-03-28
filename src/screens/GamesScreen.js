import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Chip, IconButton, Divider } from 'react-native-paper';

const GamesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 模拟游戏数据
  const games = [
    {
      id: 1,
      title: '俄罗斯方块',
      description: '一款经典的俄罗斯方块游戏，考验你的反应速度和空间想象能力。',
      category: '益智',
      image: 'tetris'
    },
    {
      id: 2,
      title: '贪吃蛇',
      description: '控制一条贪吃的蛇，吃食物并不断成长，但不要撞到自己的身体！',
      category: '休闲',
      image: 'snake'
    },
    {
      id: 3,
      title: '扫雷',
      description: '经典的扫雷游戏，需要小心谨慎地标记地雷并清除安全区域。',
      category: '益智',
      image: 'minesweeper'
    },
    {
      id: 4,
      title: '2048',
      description: '一款数字益智游戏，通过滑动合并相同的数字来获得2048。',
      category: '益智',
      image: '2048'
    },
    {
      id: 5,
      title: '飞机大战',
      description: '控制飞机躲避敌人的攻击并射击敌机，简单而经典的射击游戏。',
      category: '动作',
      image: 'planes'
    },
  ];

  // 提取所有的类别
  const categories = [...new Set(games.map(game => game.category))];

  // 过滤游戏
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? game.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const renderGameItem = ({ item }) => (
    <Card
      style={styles.gameCard}
      onPress={() => navigation.navigate('GameDetails', { id: item.id, title: item.title })}
    >
      <Card.Cover source={{ uri: `https://via.placeholder.com/400x200?text=${item.image}` }} />
      <Card.Title title={item.title} subtitle={item.category} />
      <Card.Content>
        <Paragraph>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton icon="play" onPress={() => console.log('Play game')} />
        <IconButton icon="star-outline" onPress={() => console.log('Add to favorites')} />
        <IconButton icon="information-outline" onPress={() => navigation.navigate('GameDetails', { id: item.id, title: item.title })} />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索游戏..."
        onChangeText={query => setSearchQuery(query)}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.categoriesContainer}>
        <Chip
          selected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
          style={styles.categoryChip}
        >
          全部
        </Chip>
        {categories.map(category => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryChip}
          >
            {category}
          </Chip>
        ))}
      </View>

      <Divider style={styles.divider} />

      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.gamesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryChip: {
    margin: 4,
  },
  divider: {
    marginVertical: 8,
  },
  gamesList: {
    paddingVertical: 8,
  },
  gameCard: {
    marginBottom: 16,
    elevation: 2,
  },
});

export default GamesScreen; 