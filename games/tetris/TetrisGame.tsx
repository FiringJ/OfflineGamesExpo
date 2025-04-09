import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const TetrisGame = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>COLOR BLOCKS 游戏</Text>
      <Text style={styles.subtitle}>即将推出，敬请期待！</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E2A3C',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});

export default TetrisGame; 