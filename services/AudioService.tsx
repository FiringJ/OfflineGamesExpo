import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  audioLoaded: boolean;
  toggleAudio: () => Promise<void>;
}

export const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  audioLoaded: false,
  toggleAudio: async () => { },
});

// 全局音频实例
let soundInstance: Audio.Sound | null = null;
let isInitialized = false;

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // 是否在Web环境
  const isWeb = Platform.OS === 'web';

  // 初始化音频
  useEffect(() => {
    // 避免重复初始化
    if (isInitialized) return;

    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        // 在原生App中自动播放，在Web中等待用户操作
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/background-music.mp3'),
          { shouldPlay: !isWeb, isLooping: true, volume: 0.5 }
        );

        soundInstance = sound;
        setAudioLoaded(true);

        // 如果在原生环境中自动播放
        if (!isWeb) {
          setIsPlaying(true);
        }

        isInitialized = true;

      } catch (error) {
        console.error('加载本地音频失败:', error);

        // 尝试加载备用音频
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://assets.mixkit.co/music/download/mixkit-games-worldbeat-668.mp3' },
            { shouldPlay: !isWeb, isLooping: true, volume: 0.5 }
          );

          soundInstance = sound;
          setAudioLoaded(true);

          if (!isWeb) {
            setIsPlaying(true);
          }

          isInitialized = true;

        } catch (fallbackError) {
          console.error('备用音频也加载失败:', fallbackError);
        }
      }
    };

    initAudio();

    // 清理函数 - 应用关闭时执行
    return () => {
      if (soundInstance) {
        soundInstance.unloadAsync();
        soundInstance = null;
        isInitialized = false;
      }
    };
  }, [isWeb]);

  // 切换音频播放状态
  const toggleAudio = async () => {
    if (!soundInstance) return;

    if (isPlaying) {
      await soundInstance.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundInstance.playAsync();
      setIsPlaying(true);
    }
  };

  const contextValue = {
    isPlaying,
    audioLoaded,
    toggleAudio,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// 自定义Hook方便在组件中使用
export const useAudio = () => useContext(AudioContext); 