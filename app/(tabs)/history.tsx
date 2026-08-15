import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/themed-text';
import { useAppState } from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { HistoryItem } from '@/services/history-storage';

export default function HistoryScreen() {
  const router = useRouter();
  const { historyItems } = useAppState();
  const backgroundColor = useThemeColor(
    { light: '#F9FAFB', dark: '#0F1215' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );
  const cardColor = useThemeColor(
    { light: '#FFFFFF', dark: '#181B1E' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#343A40' },
    'background',
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: titleColor }]}>History</Text>

        {historyItems.length > 0 ? (
          <View style={styles.historyList}>
            {historyItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                cardColor={cardColor}
                borderColor={borderColor}
                titleColor={titleColor}
                onPress={() =>
                  router.push({
                    pathname: '/history/[id]',
                    params: { id: item.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryCard({
  item,
  cardColor,
  borderColor,
  titleColor,
  onPress,
}: {
  item: HistoryItem;
  cardColor: string;
  borderColor: string;
  titleColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${formatHistoryDate(item.createdAt)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.historyCard,
        { backgroundColor: cardColor, borderColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.thumbnailFrame}>
        <Checkerboard />
        <Image
          source={{ uri: item.outputUri }}
          style={styles.thumbnail}
          contentFit="contain"
          accessibilityLabel={`${item.title} result preview`}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: titleColor }]}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <Text style={styles.cardDate}>{formatHistoryDate(item.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

function Checkerboard() {
  return (
    <View style={styles.checkerboard} pointerEvents="none">
      {Array.from({ length: 32 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.checkerSquare,
            index % 2 === Math.floor(index / 4) % 2
              ? styles.checkerLight
              : styles.checkerDark,
          ]}
        />
      ))}
    </View>
  );
}

function formatHistoryDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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
  historyList: {
    gap: 10,
    marginTop: 20,
  },
  historyCard: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.72,
  },
  thumbnailFrame: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  checkerboard: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkerSquare: {
    width: '25%',
    height: '12.5%',
  },
  checkerLight: {
    backgroundColor: '#FFFFFF',
  },
  checkerDark: {
    backgroundColor: '#D1D5DB',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  cardDate: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#9CA3AF',
    fontWeight: '700',
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
