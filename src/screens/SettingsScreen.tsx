import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, Divider, Button, useTheme, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColorScheme } from '../utils/theme';
import { useGameContext } from '../context/GameContext';

// 设置屏幕组件
const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { resetAllStats, resetGameStats } = useGameContext();

  // 主题设置状态
  const [colorScheme, setColorScheme] = useState<AppColorScheme>('system');

  // 声音设置状态
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 振动设置状态
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 加载主题设置
        const savedColorScheme = await AsyncStorage.getItem('colorScheme');
        if (savedColorScheme) {
          setColorScheme(savedColorScheme as AppColorScheme);
        }

        // 加载声音设置
        const savedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
        if (savedSoundEnabled !== null) {
          setSoundEnabled(savedSoundEnabled === 'true');
        }

        // 加载振动设置
        const savedVibrationEnabled = await AsyncStorage.getItem('vibrationEnabled');
        if (savedVibrationEnabled !== null) {
          setVibrationEnabled(savedVibrationEnabled === 'true');
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };

    loadSettings();
  }, []);

  // 保存颜色模式设置
  const saveColorScheme = async (value: AppColorScheme) => {
    setColorScheme(value);
    try {
      await AsyncStorage.setItem('colorScheme', value);
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  // 保存声音设置
  const saveSoundEnabled = async (value: boolean) => {
    setSoundEnabled(value);
    try {
      await AsyncStorage.setItem('soundEnabled', value.toString());
    } catch (error) {
      console.error('保存声音设置失败:', error);
    }
  };

  // 保存振动设置
  const saveVibrationEnabled = async (value: boolean) => {
    setVibrationEnabled(value);
    try {
      await AsyncStorage.setItem('vibrationEnabled', value.toString());
    } catch (error) {
      console.error('保存振动设置失败:', error);
    }
  };

  // 重置所有游戏统计数据
  const handleResetAllStats = () => {
    resetAllStats();
  };

  // 重置特定游戏的统计数据
  const handleResetGameStats = (gameId: number) => {
    resetGameStats(gameId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          设置
        </Text>

        {/* 外观设置 */}
        <List.Section>
          <List.Subheader>外观</List.Subheader>

          <RadioButton.Group
            onValueChange={(value) => saveColorScheme(value as AppColorScheme)}
            value={colorScheme}
          >
            <List.Item
              title="浅色模式"
              left={() => <RadioButton value="light" />}
              onPress={() => saveColorScheme('light')}
            />
            <List.Item
              title="深色模式"
              left={() => <RadioButton value="dark" />}
              onPress={() => saveColorScheme('dark')}
            />
            <List.Item
              title="跟随系统"
              left={() => <RadioButton value="system" />}
              onPress={() => saveColorScheme('system')}
            />
          </RadioButton.Group>
        </List.Section>

        <Divider />

        {/* 音效设置 */}
        <List.Section>
          <List.Subheader>音效</List.Subheader>

          <List.Item
            title="游戏声音"
            description="开启或关闭游戏内音效"
            right={() => (
              <Switch
                value={soundEnabled}
                onValueChange={saveSoundEnabled}
              />
            )}
          />

          <List.Item
            title="振动反馈"
            description="开启或关闭触摸振动反馈"
            right={() => (
              <Switch
                value={vibrationEnabled}
                onValueChange={saveVibrationEnabled}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* 数据管理 */}
        <List.Section>
          <List.Subheader>数据管理</List.Subheader>

          <List.Item
            title="重置所有游戏数据"
            description="清除所有游戏的分数和统计信息"
            onPress={handleResetAllStats}
          />

          <List.Accordion
            title="重置特定游戏"
            description="清除单个游戏的数据"
          >
            <List.Item
              title="重置俄罗斯方块"
              onPress={() => handleResetGameStats(1)}
            />
            <List.Item
              title="重置贪吃蛇"
              onPress={() => handleResetGameStats(2)}
            />
            <List.Item
              title="重置扫雷"
              onPress={() => handleResetGameStats(3)}
            />
            <List.Item
              title="重置2048"
              onPress={() => handleResetGameStats(4)}
            />
          </List.Accordion>
        </List.Section>

        <Divider />

        {/* 关于应用 */}
        <List.Section>
          <List.Subheader>关于</List.Subheader>

          <List.Item
            title="应用版本"
            description="1.0.0"
          />

          <List.Item
            title="开发者"
            description="离线游戏团队"
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default SettingsScreen; 