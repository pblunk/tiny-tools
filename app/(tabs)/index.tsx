import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/components/CategoryChip';
import { EmptyFavorites } from '@/components/EmptyFavorites';
import { SearchBar } from '@/components/SearchBar';
import { ToolCard } from '@/components/ToolCard';
import { Text } from '@/components/themed-text';
import { tools, type Tool, type ToolCategory } from '@/constants/tools';
import { useThemeColor } from '@/hooks/use-theme-color';

const categories: (ToolCategory | 'All')[] = [
  'All',
  'Images',
  'PDF',
  'Text',
  'Utilities',
  'AI',
];

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | 'All'
  >('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const backgroundColor = useThemeColor(
    { light: '#F9FAFB', dark: '#0F1215' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const categoryMatches =
        selectedCategory === 'All' || tool.category === selectedCategory;
      const searchMatches =
        normalizedQuery.length === 0 ||
        tool.name.toLowerCase().includes(normalizedQuery) ||
        tool.description.toLowerCase().includes(normalizedQuery) ||
        tool.category.toLowerCase().includes(normalizedQuery);

      return categoryMatches && searchMatches;
    });
  }, [query, selectedCategory]);

  const favoriteTools = useMemo(
    () => tools.filter((tool) => favorites.includes(tool.id)),
    [favorites],
  );

  const toggleFavorite = (toolId: string) => {
    setFavorites((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId],
    );
  };

  const handleToolPress = (tool: Tool) => {
    router.push(`/tool/${tool.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: titleColor }]}>TinyTools</Text>
            <Text style={styles.subtitle}>Simple tools. Done instantly.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={4}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={23}
              color={titleColor}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar value={query} onChangeText={setQuery} />

        {favoriteTools.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: titleColor }]}>
              Favorites
            </Text>
            <View style={styles.favoriteList}>
              {favoriteTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  favorite={favorites.includes(tool.id)}
                  onToggleFavorite={() => toggleFavorite(tool.id)}
                  onPress={() => handleToolPress(tool)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <EmptyFavorites />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                selected={selectedCategory === category}
                onPress={() =>
                  setSelectedCategory(category as ToolCategory | 'All')
                }
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Tools
          </Text>
          <View style={styles.toolList}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                favorite={favorites.includes(tool.id)}
                onToggleFavorite={() => toggleFavorite(tool.id)}
                onPress={() => handleToolPress(tool)}
              />
            ))}
            {filteredTools.length === 0 ? (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={24} color="#6B7280" />
                <Text style={styles.emptyResultsText}>
                  No tools match your search.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  header: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 23,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  buttonPressed: {
    backgroundColor: '#E5E7EB',
  },
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  favoriteList: {
    gap: 10,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  categoryList: {
    paddingRight: 20,
    gap: 10,
  },
  toolList: {
    gap: 10,
  },
  emptyResults: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyResultsText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
