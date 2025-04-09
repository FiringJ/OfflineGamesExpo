import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Image, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GameProvider } from '../src/context/GameContext';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // 是否在Web环境
  const isWeb = Platform.OS === 'web';

  // 加载音频
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    async function loadSound() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        // 在原生App中自动播放，在Web中等待用户操作
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/background-music.mp3'),
          { shouldPlay: !isWeb, isLooping: true, volume: 0.5 }
        );

        soundObject = sound;
        setSound(sound);
        setAudioLoaded(true);
      } catch (error) {
        console.error('加载本地音频失败:', error);
      }
    }

    loadSound();

    // 在组件卸载时停止音频播放
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [isWeb]);

  // 控制音频播放
  const toggleAudio = async () => {
    if (!sound) return;

    if (isPlaying) {
      console.log('暂停音频播放');
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      console.log('开始音频播放');
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // 根据平台返回不同的容器组件
  const Container = ({ children }: { children: React.ReactNode }) => {
    if (isWeb) {
      // Web环境使用普通View
      return <View style={styles.container}>{children}</View>;
    } else {
      // 移动端使用SafeAreaView以处理顶部和底部安全区域
      return <SafeAreaView style={styles.container} edges={['top', 'bottom']}>{children}</SafeAreaView>;
    }
  };

  return (
    <GameProvider>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Container>
        <View style={styles.header}>
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLine}></View>
            <View style={styles.hamburgerLine}></View>
          </View>

          {/* 仅在Web环境且音频已加载时显示音频控制按钮 */}
          {isWeb && audioLoaded && (
            <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
              <Text style={styles.audioButtonIcon}>
                {isPlaying ? '🔊' : '🔇'}
              </Text>
            </TouchableOpacity>
          )}
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
              onPress={() => router.push({ pathname: '/rules', params: { id: '1', name: 'COLOR BLOCKS' } })}
            >
              <View style={styles.cardWrapper}>
                <Card.Content style={[styles.gameCardContent, { backgroundColor: '#2E2A3C' }]}>
                  <Text style={[styles.gameCardTitle, { color: '#FFC107' }]}>COLOR BLOCKS</Text>
                  <View style={[styles.gameCardDivider, { backgroundColor: '#FFC107' }]} />
                  <View style={styles.gameImageContainer}>
                    <Image source={require('../assets/cards/color-blocks.png')} style={styles.gameImage} resizeMode="contain" />
                  </View>
                </Card.Content>
              </View>
            </Card>

            {/* 积木填充游戏 - BLOCK FILL */}
            <Card
              style={styles.gameCard}
              mode="elevated"
              onPress={() => router.push({ pathname: '/rules', params: { id: '4', name: 'BLOCK FILL' } })}
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
              onPress={() => router.push({ pathname: '/rules', params: { id: '5', name: 'WATER SORT' } })}
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
              onPress={() => router.push({ pathname: '/rules', params: { id: '2', name: 'FRUIT MERGE' } })}
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
              onPress={() => router.push({ pathname: '/rules', params: { id: '6', name: 'FLAPPY JUMP' } })}
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
              onPress={() => router.push({ pathname: '/rules', params: { id: '3', name: 'SPIDERETTE' } })}
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
      </Container>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E8',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 40 : 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D896A8',
  },
  audioButtonIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: Platform.OS === 'web' ? 30 : 50,
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
  },
  gameImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
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