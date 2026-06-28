import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HistoryScreen() {
  const backgroundColor = useThemeColor(
    { light: '#F9FAFB', dark: '#0F1215' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: titleColor }]}>History</Text>
        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={30} color="#6B7280" />
          </View>
          <Text style={[styles.emptyTitle, { color: titleColor }]}>
            No recent activity
          </Text>
          <Text style={styles.subtitle}>
            Tools and files you use will appear here for quick access.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 52,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
});
