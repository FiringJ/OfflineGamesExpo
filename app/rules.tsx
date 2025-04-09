import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Dimensions, PanResponder, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// 获取屏幕尺寸
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RulesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name } = params;
  const sliderRef = useRef(null);

  // 默认难度设置为中等
  const [difficulty, setDifficulty] = useState(50);

  // 是否在Web环境
  const isWeb = Platform.OS === 'web';

  // 创建滑块的PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (sliderRef.current) {
          // 滑块宽度是280，计算百分比位置
          const trackWidth = 280;
          const newValue = Math.max(0, Math.min(100, ((gestureState.moveX - 40) / trackWidth) * 100));
          setDifficulty(newValue);
        }
      },
    })
  ).current;

  // 根据difficulty值获取难度文本和表情
  const getDifficultyInfo = () => {
    if (difficulty < 30) {
      return { text: 'EASY', emoji: 'easy' };
    } else if (difficulty < 70) {
      return { text: 'MEDIUM', emoji: 'medium' };
    } else {
      return { text: 'HARD', emoji: 'hard' };
    }
  };

  // 获取当前游戏的规则文本
  const getGameRules = () => {
    // 这里可以根据游戏ID或名称返回不同的规则
    switch (id) {
      case '1': // COLOR BLOCKS
        return [
          "Stack falling blocks to complete full rows!",
          "Game ends when the blocks reach the top of the screen."
        ];
      default:
        return [
          "Pour water between the tubes until each tube contains only one colour!",
          "You can only pour water of the same color onto water already in a tube."
        ];
    }
  };

  // 开始游戏
  const startGame = () => {
    router.push({
      pathname: '/play',
      params: {
        id,
        difficulty: getDifficultyInfo().text
      }
    });
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

  const difficultyInfo = getDifficultyInfo();
  const rules = getGameRules();

  // 渲染表情图标 - 修改为符合UI稿的卡通表情
  const renderEmoji = () => {
    // 不同难度显示不同表情
    switch (difficultyInfo.emoji) {
      case 'easy':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#4CAF50' }]}>
            <View style={styles.emojiInner}>
              <View style={styles.eyeContainer}>
                <View style={styles.eye} />
                <View style={styles.eye} />
              </View>
              <View style={styles.smile} />
            </View>
          </View>
        );
      case 'medium':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#FF9800' }]}>
            <View style={styles.emojiInner}>
              <View style={styles.eyeContainer}>
                <View style={[styles.eye, styles.eyeMedium]} />
                <View style={[styles.eye, styles.eyeMedium]} />
              </View>
              <View style={styles.mouthMedium} />
            </View>
          </View>
        );
      case 'hard':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#F44336' }]}>
            <View style={styles.emojiInner}>
              <View style={styles.eyeContainer}>
                <View style={[styles.eye, styles.eyeHard]} />
                <View style={[styles.eye, styles.eyeHard]} />
              </View>
              <View style={styles.frownHard} />
            </View>
          </View>
        );
    }
  };

  return (
    <Container>
      {/* 背景图案 - 半透明的游戏元素 */}
      <View style={styles.backgroundPattern}></View>

      {/* 顶部区域 - 使用深紫色渐变 */}
      <LinearGradient
        colors={['#3a2156', '#44285e']}
        style={styles.topBackground}
      />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>{name}</Text>

        <TouchableOpacity style={styles.starButton}>
          <Ionicons name="star-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* 主内容区域 */}
      <View style={styles.content}>

        {/* 难度调节区域 */}
        <View style={styles.difficultyContainer}>
          {/* 卡通表情 */}
          {renderEmoji()}

          <Text style={styles.difficultyText}>{difficultyInfo.text}</Text>

          {/* 滑动条 - 更粗、带渐变 */}
          <View
            style={styles.sliderContainer}
            ref={sliderRef}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={['#FF9800', '#CCCCCC', '#4169E1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sliderTrack}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${difficulty}%` }
              ]}
            />
          </View>
          <Text style={styles.dragText}>Drag to adjust difficulty</Text>
        </View>

        {/* 开始游戏按钮区域 */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={startGame}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E8',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: -1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    opacity: 0.1,
    zIndex: 0,
    backgroundColor: 'transparent',
    // 可以添加一个背景图案
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    zIndex: 1,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rulesContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  ruleIconContainer: {
    marginRight: 10,
    marginTop: 4,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#8BC34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  primaryRule: {
    color: '#9932CC',
  },
  secondaryRule: {
    color: '#4A4A4A',
  },
  difficultyContainer: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#000',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emojiInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFEB3B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  eyeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 40,
    marginBottom: 10,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  eyeMedium: {
    transform: [{ scaleY: 0.7 }],
  },
  eyeHard: {
    transform: [{ scaleY: 0.5 }],
  },
  smile: {
    width: 30,
    height: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  mouthMedium: {
    width: 30,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  frownHard: {
    width: 30,
    height: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#000',
  },
  difficultyText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#F8961D',
    marginBottom: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sliderContainer: {
    position: 'relative',
    width: 280,
    height: 50,
    marginBottom: 15,
  },
  sliderTrack: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 280,
    height: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF8C00',
    transform: [{ translateX: -17 }], // 居中调整
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dragText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 15,
    elevation: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  playButtonText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    marginTop: 5,
    fontWeight: '500',
  },
  helpButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9932CC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: '#A64CE3',
  },
  helpButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    zIndex: -1,
  },
  grassImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 20,
    zIndex: 1,
  },
  cloud1: {
    width: 100,
    height: 30,
    bottom: 80,
    left: '15%',
  },
  cloud2: {
    width: 70,
    height: 25,
    bottom: 70,
    right: '20%',
  },
  cloudBump: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
  },
  cloudBump1: {
    width: 30,
    height: 30,
    top: -15,
    left: 15,
  },
  cloudBump2: {
    width: 40,
    height: 40,
    top: -20,
    left: 40,
  },
  cloudBump3: {
    width: 30,
    height: 30,
    top: -15,
    left: 70,
  },
}); 