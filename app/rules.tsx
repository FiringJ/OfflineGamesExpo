import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Dimensions, PanResponder } from 'react-native';
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
  const [level, setLevel] = useState(1);

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

          // 根据难度设置关卡
          if (newValue < 30) setLevel(1);
          else if (newValue < 70) setLevel(5);
          else setLevel(10);
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
          "✅ Stack falling blocks to complete full rows!",
          "⚠️ Game ends when the blocks reach the top of the screen."
        ];
      default:
        return [
          "✅ Follow the game instructions to win!",
          "⚠️ Have fun and challenge yourself!"
        ];
    }
  };

  // 开始游戏
  const startGame = () => {
    router.push({
      pathname: '/play',
      params: {
        id,
        difficulty: getDifficultyInfo().text,
        level
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

  // 渲染表情图标
  const renderEmoji = () => {
    switch (difficultyInfo.emoji) {
      case 'easy':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="happy-outline" size={46} color="#FFFFFF" />
          </View>
        );
      case 'medium':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="glasses-outline" size={46} color="#FFFFFF" />
          </View>
        );
      case 'hard':
        return (
          <View style={[styles.emojiCircle, { backgroundColor: '#F44336' }]}>
            <Ionicons name="sad-outline" size={46} color="#FFFFFF" />
          </View>
        );
    }
  };

  return (
    <Container>
      {/* 背景图案 - 半透明的游戏元素 */}
      <View style={styles.backgroundPattern}></View>

      {/* 顶部区域分割 */}
      <View style={styles.topColorBand}></View>

      {/* 顶部导航栏 */}
      <LinearGradient
        colors={['#8A2BE2', '#9932CC']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>{name}</Text>

        <TouchableOpacity style={styles.starButton}>
          <Ionicons name="star" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* 主内容区域 */}
      <View style={styles.content}>
        {/* 游戏规则说明 */}
        <View style={styles.rulesContainer}>
          {rules.map((rule, index) => (
            <Text
              key={index}
              style={[
                styles.ruleText,
                index === 0 ? styles.primaryRule : styles.secondaryRule
              ]}
            >
              {rule}
            </Text>
          ))}
        </View>

        {/* 难度调节区域 */}
        <View style={styles.difficultyContainer}>
          {/* 表情符号 */}
          {renderEmoji()}

          <Text style={styles.difficultyText}>{difficultyInfo.text}</Text>

          {/* 滑动条 */}
          <View
            style={styles.sliderContainer}
            ref={sliderRef}
            {...panResponder.panHandlers}
          >
            <LinearGradient
              colors={['#FFA500', '#4169E1']}
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
            <Text style={styles.levelText}>Level {level}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* 底部装饰 - 草地和云朵 */}
        <View style={styles.bottomDecoration}>
          <LinearGradient
            colors={['#7CFC00', '#228B22']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.grassImage}
          />

          {/* 云朵装饰 */}
          <View style={[styles.cloud, styles.cloud1]}>
            <View style={[styles.cloudBump, styles.cloudBump1]} />
            <View style={[styles.cloudBump, styles.cloudBump2]} />
            <View style={[styles.cloudBump, styles.cloudBump3]} />
          </View>

          <View style={[styles.cloud, styles.cloud2]}>
            <View style={[styles.cloudBump, styles.cloudBump1]} />
            <View style={[styles.cloudBump, styles.cloudBump2]} />
          </View>
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
  topColorBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: '#8A2BE2',
    zIndex: -1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#FFF',
    zIndex: -2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 182, 193, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  starButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  rulesContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  ruleText: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
    lineHeight: 32,
  },
  primaryRule: {
    color: '#9932CC',
  },
  secondaryRule: {
    color: '#444',
  },
  difficultyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emojiCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  difficultyText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 25,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  sliderContainer: {
    position: 'relative',
    width: 280,
    height: 50,
    marginBottom: 15,
  },
  sliderTrack: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 280,
    height: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: 11,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF8C00',
    transform: [{ translateX: -15 }], // 居中调整
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
    marginTop: 50,
    justifyContent: 'center',
    width: '100%',
  },
  playButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 15,
    elevation: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  playButtonText: {
    color: 'white',
    fontSize: 38,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    marginLeft: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  },
  grassImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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