import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Image } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider } from '../src/context/GameContext';
import { Audio } from 'expo-av';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // 加载并播放背景音乐
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    async function loadSound() {
      try {
        console.log('正在加载网络音频...');
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/music/download/mixkit-games-worldbeat-668.mp3' },
          { shouldPlay: true, isLooping: true, volume: 0.5 }
        );
        soundObject = sound;
        setSound(sound);
        console.log('背景音乐已开始播放');
      } catch (error) {
        console.error('加载音频失败:', error);
      }
    }

    loadSound();

    // 在组件卸载时停止音频播放
    return () => {
      if (soundObject) {
        console.log('停止音频播放');
        soundObject.unloadAsync();
      }
    };
  }, []);

  return (
    <GameProvider>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 游戏卡片网格 */}
          <View style={styles.gamesGrid}>
            {/* 彩色块游戏 - COLOR BLOCKS */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=1')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#2E2A3C' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#FFC107' }]}>COLOR BLOCKS</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#FFC107' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/tetris.png')} style={styles.gameImage} resizeMode="contain" />
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* 积木填充游戏 - BLOCK FILL */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=4')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#222B2D' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#CCCCCC' }]}>BLOCK FILL</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#CCCCCC' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/2048.png')} style={styles.gameImage} resizeMode="contain" />
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* 水滴分类游戏 - WATER SORT */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=5')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#412C50' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#E0AAFF' }]}>WATER SORT</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#E0AAFF' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/snake.png')} style={styles.gameImage} resizeMode="contain" />
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* 水果合并游戏 - FRUIT MERGE */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=2')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#FFE8C4' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#E53935' }]}>FRUIT MERGE</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#E53935' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/snake.png')} style={styles.gameImage} resizeMode="contain" />
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* Flappy Jump游戏 - 带NEW标签 */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=6')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#FFEEC8' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#8B4513' }]}>FLAPPY JUMP</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#8B4513' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/minesweeper.png')} style={styles.gameImage} resizeMode="contain" />
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW!</Text>
                    </View>
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* Spiderette游戏 - 带NEW标签 */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push('/play?id=3')}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#1A1A2E' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#9C27B0' }]}>SPIDERETTE</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#9C27B0' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/minesweeper.png')} style={styles.gameImage} resizeMode="contain" />
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW!</Text>
                    </View>
                  </View>
                </Card.Content>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E8',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburgerMenu: {
    width: 30,
    height: 25,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#D896A8',
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 30,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'visible',
    elevation: 0,
    backgroundColor: 'transparent',
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  gameCardContent: {
    padding: 16,
    paddingBottom: 20,
    borderRadius: 20,
    height: 190,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  gameCardDivider: {
    width: 80,
    height: 3,
    marginBottom: 15,
    borderRadius: 5,
  },
  gameImageContainer: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  gameImage: {
    width: '85%',
    height: '85%',
    borderRadius: 10,
  },
  newBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#FF5252',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  newBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
}); 