import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Divider, List, Chip, Badge } from 'react-native-paper';

const GameDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;

  // 模拟游戏数据
  const games = {
    1: {
      id: 1,
      title: '俄罗斯方块',
      description: '一款经典的俄罗斯方块游戏，考验你的反应速度和空间想象能力。',
      longDescription: '俄罗斯方块是一款由俄罗斯人阿列克谢·帕基特诺夫于1984年6月发明的休闲游戏。游戏的目标是控制不同形状的方块下落，并将它们排列成完整的一行以消除方块。随着游戏的进行，方块下落的速度会越来越快，增加游戏的难度。',
      category: '益智',
      difficulty: '中等',
      version: '1.2.0',
      lastUpdate: '2023-05-15',
      size: '2.5 MB',
      rating: 4.5,
      image: 'tetris',
      features: ['单人模式', '计分系统', '难度调整', '音效'],
      screenshots: ['tetris1', 'tetris2', 'tetris3'],
    },
    2: {
      id: 2,
      title: '贪吃蛇',
      description: '控制一条贪吃的蛇，吃食物并不断成长，但不要撞到自己的身体！',
      longDescription: '贪吃蛇是一个经典的街机游戏，最早出现在1976年的街机游戏《Blockade》中。在游戏中，玩家控制一条蛇在封闭的空间内移动，吃掉随机出现的食物后蛇身会变长，玩家需要避免蛇碰到自己的身体或边界，否则游戏结束。',
      category: '休闲',
      difficulty: '简单',
      version: '1.1.3',
      lastUpdate: '2023-04-10',
      size: '1.8 MB',
      rating: 4.0,
      image: 'snake',
      features: ['单人模式', '计分系统', '速度调整'],
      screenshots: ['snake1', 'snake2'],
    },
    3: {
      id: 3,
      title: '扫雷',
      description: '经典的扫雷游戏，需要小心谨慎地标记地雷并清除安全区域。',
      longDescription: '扫雷是一款单人益智游戏，玩家需要清除隐藏在二维网格中的地雷，同时避免触发任何一个地雷。通过点击网格中的单元格，如果单元格下没有地雷，会显示周围八个单元格中地雷的数量；如果没有地雷在周围，游戏会自动展开周围的单元格。',
      category: '益智',
      difficulty: '困难',
      version: '1.3.1',
      lastUpdate: '2023-06-20',
      size: '3.0 MB',
      rating: 4.2,
      image: 'minesweeper',
      features: ['三种难度', '计时器', '标记功能'],
      screenshots: ['minesweeper1', 'minesweeper2', 'minesweeper3'],
    },
  };

  const game = games[id];

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Title>游戏不存在</Title>
        <Button mode="contained" onPress={() => navigation.goBack()}>返回</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: `https://via.placeholder.com/600x300?text=${game.image}` }} />
        <Card.Title title={game.title} subtitle={`分类: ${game.category} | 难度: ${game.difficulty}`} />
        <Card.Content>
          <Title>游戏简介</Title>
          <Paragraph>{game.longDescription}</Paragraph>

          <Divider style={styles.divider} />

          <Title>游戏特点</Title>
          <View style={styles.featuresContainer}>
            {game.features.map((feature, index) => (
              <Chip key={index} style={styles.featureChip}>{feature}</Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Title>游戏截图</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshotsContainer}>
            {game.screenshots.map((screenshot, index) => (
              <Card key={index} style={styles.screenshotCard}>
                <Card.Cover source={{ uri: `https://via.placeholder.com/300x200?text=${screenshot}` }} />
              </Card>
            ))}
          </ScrollView>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Item
              title="版本"
              description={game.version}
              left={props => <List.Icon {...props} icon="update" />}
            />
            <List.Item
              title="最后更新"
              description={game.lastUpdate}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="大小"
              description={game.size}
              left={props => <List.Icon {...props} icon="file" />}
            />
            <List.Item
              title="评分"
              description={`${game.rating}/5.0`}
              left={props => <List.Icon {...props} icon="star" />}
            />
          </List.Section>
        </Card.Content>

        <Card.Actions style={styles.actionsContainer}>
          <Button mode="contained" style={styles.actionButton}>开始游戏</Button>
          <Button mode="outlined" style={styles.actionButton}>添加到收藏</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    marginVertical: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureChip: {
    margin: 4,
  },
  screenshotsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  screenshotCard: {
    width: 300,
    marginRight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default GameDetailsScreen; 