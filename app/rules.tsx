import React, { useState, useRef, ChangeEvent, useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Dimensions, PanResponder, Image, Animated } from 'react-native';
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
  const sliderContainerRef = useRef(null);

  // 使用Animated.Value实现更流畅的动画
  const [difficulty, setDifficulty] = useState(50);
  const animatedThumbPosition = useRef(new Animated.Value(50)).current;

  // 更新难度和动画值
  const updateDifficulty = useCallback((value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setDifficulty(newValue);
    Animated.timing(animatedThumbPosition, {
      toValue: newValue,
      duration: 5, // 短动画使体验更响应
      useNativeDriver: false, // 必须为false才能动画布局属性
    }).start();
  }, [animatedThumbPosition]);

  // 是否在Web环境
  const isWeb = Platform.OS === 'web';

  // 使用useCallback优化PanResponder的创建
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    // 记录初始位置，避免拖动时的跳跃
    onPanResponderGrant: () => {
      // 不需要额外操作，我们继续使用当前值
    },
    onPanResponderMove: (evt, gestureState) => {
      // 计算横向移动与滑块宽度的比例
      const trackWidth = 280;
      const movePosition = gestureState.moveX - (SCREEN_WIDTH - trackWidth) / 2;
      const percentage = (movePosition / trackWidth) * 100;
      updateDifficulty(percentage);
    },
    onPanResponderRelease: () => {
      // 结束拖动，不需要额外操作
    }
  }), [updateDifficulty]);

  // 处理HTML滑块值变化
  const handleHtmlSliderChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    updateDifficulty(Number(e.target.value));
  }, [updateDifficulty]);

  // 处理返回按钮点击
  const handleBackPress = useCallback(() => {
    if (isWeb) {
      // Web环境下直接导航到首页
      router.push('/');
    } else {
      // 移动端尝试返回
      router.back();
    }
  }, [isWeb, router]);

  // 根据difficulty值获取难度文本和表情
  const difficultyInfo = useMemo(() => {
    if (difficulty < 30) {
      return { text: 'EASY', emoji: 'easy' };
    } else if (difficulty < 70) {
      return { text: 'MEDIUM', emoji: 'medium' };
    } else {
      return { text: 'HARD', emoji: 'hard' };
    }
  }, [difficulty]);

  // 获取当前游戏的规则文本
  const rules = useMemo(() => {
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
  }, [id]);

  // 开始游戏
  const startGame = useCallback(() => {
    router.push({
      pathname: '/play',
      params: {
        id,
        difficulty: difficultyInfo.text
      }
    });
  }, [router, id, difficultyInfo.text]);

  // 根据平台返回不同的容器组件
  const Container = useCallback(({ children }: { children: React.ReactNode }) => {
    if (isWeb) {
      // Web环境使用普通View
      return <View style={styles.container}>{children}</View>;
    } else {
      // 移动端使用SafeAreaView以处理顶部和底部安全区域
      return <SafeAreaView style={styles.container} edges={['top', 'bottom']}>{children}</SafeAreaView>;
    }
  }, [isWeb]);

  // 渲染表情图标 - 修改为符合UI稿的卡通表情
  const renderEmoji = useCallback(() => {
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
  }, [difficultyInfo.emoji]);

  // 渲染Web环境的HTML滑块
  const renderWebSlider = useCallback(() => {
    return (
      <View style={styles.webSliderContainer}>
        {/* 以下是原生HTML滑块 */}
        {Platform.OS === 'web' && (
          <input
            type="range"
            min="0"
            max="100"
            value={difficulty}
            onChange={handleHtmlSliderChange}
            style={{
              width: 280,
              height: 40,
              appearance: 'none',
              background: 'linear-gradient(to right, #FF9800, #CCCCCC, #4169E1)',
              outline: 'none',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          />
        )}

        {/* 滑块外观（仅用于显示，实际交互由HTML原生控件处理） */}
        <View
          style={[
            styles.sliderThumb,
            { left: `${difficulty}%`, pointerEvents: 'none' }
          ]}
        />
      </View>
    );
  }, [difficulty, handleHtmlSliderChange]);

  // 移动端滑块的渲染优化
  const renderMobileSlider = useCallback(() => {
    const thumbLeft = animatedThumbPosition.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%']
    });

    return (
      <View
        style={styles.sliderContainer}
        ref={sliderContainerRef}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={['#FF9800', '#CCCCCC', '#4169E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sliderTrack}
        />
        <Animated.View
          style={[
            styles.sliderThumb,
            { left: thumbLeft }
          ]}
        />
      </View>
    );
  }, [animatedThumbPosition, panResponder.panHandlers]);

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
          onPress={handleBackPress}
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

          {/* 滑动条 - 基于平台选择实现 */}
          {isWeb ? renderWebSlider() : renderMobileSlider()}
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
    justifyContent: 'center',
  },
  webSliderContainer: {
    position: 'relative',
    width: 280,
    height: 50,
    marginBottom: 15,
    justifyContent: 'center',
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
    zIndex: 5,
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
}); 