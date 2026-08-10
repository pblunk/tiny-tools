import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ToolCard } from '@/components/ToolCard';
import { Text } from '@/components/themed-text';
import { tools, type Tool } from '@/constants/tools';
import { useAppState } from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteIds, isFavorite, toggleFavorite } = useAppState();
  const backgroundColor = useThemeColor(
    { light: '#F9FAFB', dark: '#0F1215' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );

  const favoriteTools = useMemo(
    () => tools.filter((tool) => favoriteIds.includes(tool.id)),
    [favoriteIds],
  );

  const handleToolPress = (tool: Tool) => {
    router.push(`/tool/${tool.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: titleColor }]}>Favorites</Text>

        {favoriteTools.length > 0 ? (
          <View style={styles.toolList}>
            {favoriteTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                favorite={isFavorite(tool.id)}
                onToggleFavorite={() => toggleFavorite(tool.id)}
                onPress={() => handleToolPress(tool)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart-outline" size={30} color="#6B7280" />
            </View>
            <Text style={[styles.emptyTitle, { color: titleColor }]}>
              No favorite tools yet
            </Text>
            <Text style={styles.subtitle}>
              Tap the heart on any tool to add it here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 20,
  },
  toolList: {
    gap: 10,
  },
  emptyState: {
    flex: 1,
    minHeight: 420,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 52,
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
