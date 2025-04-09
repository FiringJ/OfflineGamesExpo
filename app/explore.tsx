import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { Text, IconButton, Card, useTheme, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider } from '../src/context/GameContext';

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <GameProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.push('/')}
          />
          <Text style={styles.title}>探索更多游戏</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView style={styles.container}>
          <Text style={styles.sectionTitle}>即将推出的游戏</Text>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge">更多游戏正在开发中</Text>
              <Text variant="bodyMedium" style={styles.description}>
                我们正在努力开发更多有趣的离线游戏。敬请期待！
              </Text>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>最受欢迎</Text>

          <Card style={styles.card} mode="elevated" onPress={() => router.push('/play?id=1')}>
            <Card.Content>
              <Text variant="titleLarge">COLOR BLOCKS</Text>
              <Text variant="bodyMedium" style={styles.description}>
                经典的俄罗斯方块游戏，考验你的空间想象能力和反应速度。
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => router.push('/play?id=1')}>开始游戏</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card} mode="elevated" onPress={() => router.push('/play?id=4')}>
            <Card.Content>
              <Text variant="titleLarge">BLOCK FILL</Text>
              <Text variant="bodyMedium" style={styles.description}>
                挑战数字组合，将相同的数字合并，看看你能否达到2048！
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => router.push('/play?id=4')}>开始游戏</Button>
            </Card.Actions>
          </Card>
        </ScrollView>
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
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  }
}); 