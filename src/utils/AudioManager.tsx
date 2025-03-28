import { Audio, AVPlaybackSource } from 'expo-av';
import { useEffect, useState } from 'react';

type SoundType = {
  [key: string]: Audio.Sound | null;
};

interface AudioManagerProps {
  sounds: {
    [key: string]: AVPlaybackSource;
  };
  options?: {
    [key: string]: {
      isLooping?: boolean;
      volume?: number;
    };
  };
  autoPlayBackground?: string;
}

export const useAudioManager = ({
  sounds,
  options = {},
  autoPlayBackground
}: AudioManagerProps) => {
  const [soundObjects, setSoundObjects] = useState<SoundType>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  // 初始化音频系统并加载所有音频资源
  useEffect(() => {
    const loadSounds = async () => {
      const errors: string[] = [];

      try {
        // 初始化音频模式
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const loadedSounds: SoundType = {};

        // 加载每个声音
        for (const [key, source] of Object.entries(sounds)) {
          try {
            const soundOptions = options[key] || {};
            const { sound } = await Audio.Sound.createAsync(source, {
              isLooping: soundOptions.isLooping || false,
              volume: soundOptions.volume || 0.7
            });
            loadedSounds[key] = sound;

            // 如果是背景音乐并且设置了自动播放
            if (key === autoPlayBackground && !isMuted) {
              await sound.playAsync();
            }
          } catch (error) {
            console.log(`加载音效 "${key}" 失败:`, error);
            errors.push(key);
            loadedSounds[key] = null;
          }
        }

        setSoundObjects(loadedSounds);
      } catch (error) {
        console.log('音频系统初始化失败:', error);
        errors.push('system');
      } finally {
        setLoadErrors(errors);
        setIsReady(true);
      }
    };

    loadSounds();

    // 清理音效
    return () => {
      try {
        Object.values(soundObjects).forEach(sound => {
          if (sound) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.log('音效资源清理失败:', error);
      }
    };
  }, []);

  // 播放音效
  const playSound = async (key: string) => {
    if (isMuted || !soundObjects[key]) return;

    try {
      const sound = soundObjects[key];
      if (sound) {
        await sound.stopAsync().catch(() => { });
        await sound.playFromPositionAsync(0).catch(() => { });
      }
    } catch (error) {
      console.log(`播放音效 "${key}" 失败，但游戏继续:`, error);
    }
  };

  // 切换静音状态
  const toggleMute = async () => {
    try {
      const newMuteState = !isMuted;

      // 如果有背景音乐，控制背景音乐的播放状态
      if (autoPlayBackground && soundObjects[autoPlayBackground]) {
        const bgMusic = soundObjects[autoPlayBackground];
        if (bgMusic) {
          if (newMuteState) {
            await bgMusic.pauseAsync().catch(() => { });
          } else {
            await bgMusic.playAsync().catch(() => { });
          }
        }
      }

      setIsMuted(newMuteState);
    } catch (error) {
      console.log('静音切换失败，直接更新静音状态:', error);
      setIsMuted(!isMuted); // 即使出错也更新UI状态
    }
  };

  // 停止所有音效
  const stopAllSounds = async () => {
    try {
      for (const sound of Object.values(soundObjects)) {
        if (sound) {
          await sound.stopAsync().catch(() => { });
        }
      }
    } catch (error) {
      console.log('停止所有音效失败:', error);
    }
  };

  // 播放背景音乐
  const playBackgroundMusic = async () => {
    if (!autoPlayBackground || isMuted) return;

    try {
      const bgMusic = soundObjects[autoPlayBackground];
      if (bgMusic) {
        await bgMusic.playAsync().catch(() => { });
      }
    } catch (error) {
      console.log('播放背景音乐失败:', error);
    }
  };

  // 暂停背景音乐
  const pauseBackgroundMusic = async () => {
    if (!autoPlayBackground) return;

    try {
      const bgMusic = soundObjects[autoPlayBackground];
      if (bgMusic) {
        await bgMusic.pauseAsync().catch(() => { });
      }
    } catch (error) {
      console.log('暂停背景音乐失败:', error);
    }
  };

  return {
    playSound,
    toggleMute,
    isMuted,
    isReady,
    loadErrors,
    stopAllSounds,
    playBackgroundMusic,
    pauseBackgroundMusic
  };
};

export default useAudioManager; 