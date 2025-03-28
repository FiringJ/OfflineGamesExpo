import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, List, useTheme, Divider } from 'react-native-paper';
import { useGameContext } from '../context/GameContext';

// 游戏统计屏幕
const StatsScreen: React.FC = () => {
  const theme = useTheme();
  const { gameData } = useGameContext();

  // 游戏名称映射
  const gameNames: Record<number, string> = {
    1: '俄罗斯方块',
    2: '贪吃蛇',
    3: '扫雷',
    4: '2048',
  };

  // 计算游戏总游玩次数
  const getTotalPlayCount = () => {
    return Object.values(gameData).reduce((total, game) => total + game.playCount, 0);
  };

  // 获取最高分和最常玩的游戏
  const getStats = () => {
    let topScore = { gameId: 0, score: 0 };
    let mostPlayed = { gameId: 0, count: 0 };

    Object.entries(gameData).forEach(([id, data]) => {
      const numId = Number(id);
      if (data.highScore > topScore.score) {
        topScore = { gameId: numId, score: data.highScore };
      }
      if (data.playCount > mostPlayed.count) {
        mostPlayed = { gameId: numId, count: data.playCount };
      }
    });

    return { topScore, mostPlayed };
  };

  // 计算游戏数据
  const totalPlayCount = getTotalPlayCount();
  const { topScore, mostPlayed } = getStats();

  // 计算各游戏的游玩比例
  const getPlayPercentage = (gameId: number) => {
    if (totalPlayCount === 0) return 0;
    const playCount = gameData[gameId]?.playCount || 0;
    return playCount / totalPlayCount;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        游戏统计
      </Text>

      <ScrollView>
        {totalPlayCount > 0 ? (
          <>
            {/* 总游玩统计 */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  总览
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="headlineMedium" style={styles.statValue}>
                      {totalPlayCount}
                    </Text>
                    <Text variant="bodyMedium">
                      游戏总次数
                    </Text>
                  </View>

                  {topScore.gameId > 0 && (
                    <View style={styles.statItem}>
                      <Text variant="headlineMedium" style={styles.statValue}>
                        {gameNames[topScore.gameId]}
                      </Text>
                      <Text variant="bodyMedium">
                        最高分: {topScore.score}
                      </Text>
                    </View>
                  )}

                  {mostPlayed.gameId > 0 && (
                    <View style={styles.statItem}>
                      <Text variant="headlineMedium" style={styles.statValue}>
                        {gameNames[mostPlayed.gameId]}
                      </Text>
                      <Text variant="bodyMedium">
                        最常玩游戏
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>

            {/* 游戏明细 */}
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  游戏详情
                </Text>

                <List.Section>
                  {Object.keys(gameNames).map((idStr) => {
                    const id = Number(idStr);
                    const game = gameData[id];
                    const playPercentage = getPlayPercentage(id);

                    return (
                      <View key={id}>
                        <List.Item
                          title={gameNames[id]}
                          description={`最高分: ${game?.highScore || 0} | 游玩次数: ${game?.playCount || 0}`}
                        />
                        <ProgressBar
                          progress={playPercentage}
                          color={theme.colors.primary}
                          style={styles.progressBar}
                        />
                        <Text style={styles.percentageText}>
                          {(playPercentage * 100).toFixed(1)}% 的游戏时间
                        </Text>
                        <Divider style={styles.divider} />
                      </View>
                    );
                  })}
                </List.Section>
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyText}>
                还没有游戏记录
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubText}>
                开始玩游戏后，这里将显示您的游戏统计数据
              </Text>
            </Card.Content>
          </Card>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    marginBottom: 12,
    minWidth: '30%',
  },
  statValue: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'right',
  },
  divider: {
    marginBottom: 12,
  },
  emptyCard: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default StatsScreen; 