import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  List,
  Switch,
  Divider,
  Title,
  Text,
  Dialog,
  Portal,
  Button,
  RadioButton,
  Paragraph
} from 'react-native-paper';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // 对话框状态
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [storageDialogVisible, setStorageDialogVisible] = useState(false);

  // 主题和语言选择
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.sectionTitle}>外观设置</Title>
      <List.Item
        title="暗黑模式"
        description="切换应用的明暗主题"
        left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
        right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
      />
      <List.Item
        title="主题设置"
        description="选择应用主题"
        left={(props) => <List.Icon {...props} icon="palette" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => setThemeDialogVisible(true)}
      />
      <List.Item
        title="语言"
        description="设置应用的显示语言"
        left={(props) => <List.Icon {...props} icon="translate" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => setLanguageDialogVisible(true)}
      />

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>声音和通知</Title>
      <List.Item
        title="游戏音效"
        description="启用或禁用游戏中的音效"
        left={(props) => <List.Icon {...props} icon="volume-high" />}
        right={() => <Switch value={soundEnabled} onValueChange={setSoundEnabled} />}
      />
      <List.Item
        title="通知"
        description="启用或禁用应用通知"
        left={(props) => <List.Icon {...props} icon="bell" />}
        right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
      />

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>游戏设置</Title>
      <List.Item
        title="自动保存"
        description="自动保存游戏进度"
        left={(props) => <List.Icon {...props} icon="content-save" />}
        right={() => <Switch value={autoSave} onValueChange={setAutoSave} />}
      />
      <List.Item
        title="存储管理"
        description="管理游戏存档和缓存"
        left={(props) => <List.Icon {...props} icon="folder" />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => setStorageDialogVisible(true)}
      />

      <Divider style={styles.divider} />

      <Title style={styles.sectionTitle}>关于</Title>
      <List.Item
        title="版本"
        description="1.0.0"
        left={(props) => <List.Icon {...props} icon="information" />}
      />
      <List.Item
        title="检查更新"
        left={(props) => <List.Icon {...props} icon="update" />}
        onPress={() => console.log('检查更新')}
      />
      <List.Item
        title="隐私政策"
        left={(props) => <List.Icon {...props} icon="shield-account" />}
        onPress={() => console.log('查看隐私政策')}
      />
      <List.Item
        title="反馈问题"
        left={(props) => <List.Icon {...props} icon="message-alert" />}
        onPress={() => console.log('反馈问题')}
      />

      {/* 主题选择对话框 */}
      <Portal>
        <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>选择主题</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setSelectedTheme(value)} value={selectedTheme}>
              <RadioButton.Item label="跟随系统" value="system" />
              <RadioButton.Item label="浅色主题" value="light" />
              <RadioButton.Item label="深色主题" value="dark" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>取消</Button>
            <Button onPress={() => {
              console.log('应用主题:', selectedTheme);
              setThemeDialogVisible(false);
            }}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 语言选择对话框 */}
      <Portal>
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
          <Dialog.Title>选择语言</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setSelectedLanguage(value)} value={selectedLanguage}>
              <RadioButton.Item label="简体中文" value="zh-CN" />
              <RadioButton.Item label="English" value="en-US" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)}>取消</Button>
            <Button onPress={() => {
              console.log('应用语言:', selectedLanguage);
              setLanguageDialogVisible(false);
            }}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 存储管理对话框 */}
      <Portal>
        <Dialog visible={storageDialogVisible} onDismiss={() => setStorageDialogVisible(false)}>
          <Dialog.Title>存储管理</Dialog.Title>
          <Dialog.Content>
            <Paragraph>游戏存档: 56 MB</Paragraph>
            <Paragraph>缓存数据: 22 MB</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStorageDialogVisible(false)}>取消</Button>
            <Button onPress={() => {
              console.log('清除缓存');
              setStorageDialogVisible(false);
            }}>清除缓存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
});

export default SettingsScreen; 