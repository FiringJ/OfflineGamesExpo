import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Divider, List, useTheme } from 'react-native-paper';

// 关于应用屏幕
const AboutScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>离线游戏集合</Text>
          <Text style={styles.version}>版本 1.0.0</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              关于应用
            </Text>
            <Text variant="bodyMedium" style={styles.paragraph}>
              离线游戏集合是一款包含多种经典游戏的移动应用。所有游戏均可离线游玩，无需网络连接，让您随时随地都能享受游戏乐趣。
            </Text>
            <Text variant="bodyMedium" style={styles.paragraph}>
              这款应用使用 React Native 和 Expo 构建，为您带来流畅的游戏体验和精美的用户界面。
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              游戏列表
            </Text>
            <List.Section>
              <List.Item
                title="2048"
                description="滑动合并数字方块，达到2048"
                left={props => <List.Icon {...props} icon="puzzle" />}
              />
              <Divider />
              <List.Item
                title="俄罗斯方块"
                description="经典的方块消除游戏"
                left={props => <List.Icon {...props} icon="shape" />}
              />
              <Divider />
              <List.Item
                title="贪吃蛇"
                description="控制蛇吃食物并成长"
                left={props => <List.Icon {...props} icon="snake" />}
              />
              <Divider />
              <List.Item
                title="扫雷"
                description="找出所有安全的方格"
                left={props => <List.Icon {...props} icon="bomb" />}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              开发者信息
            </Text>
            <Text variant="bodyMedium" style={styles.paragraph}>
              © 2023 离线游戏开发团队
            </Text>
            <Text variant="bodyMedium" style={styles.paragraph}>
              本应用仅供个人学习和娱乐使用。
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            感谢您使用离线游戏集合
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 16,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default AboutScreen;