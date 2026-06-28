import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/themed-text';
import { ToolIconWithBackground } from '@/components/ToolIconRenderer';
import { tools } from '@/constants/tools';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ToolDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const tool = useMemo(() => tools.find((item) => item.id === slug), [slug]);
  const backgroundColor = useThemeColor(
    { light: '#fff', dark: '#181B1E' },
    'background',
  );

  if (!tool) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={styles.title}>Tool not found</Text>
        <Text style={styles.body}>
          Tap a tool card on the home screen to open its page.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: tool.name, headerBackTitle: 'Back' }} />
      <View style={styles.header}>
        <ToolIconWithBackground toolId={tool.id} size={62} />
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{tool.name}</Text>
          <Text style={styles.subtitle}>{tool.description}</Text>
        </View>
      </View>

      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>This tool is coming soon.</Text>
        <Text style={styles.placeholderText}>
          The TinyTools experience is under construction here. This space will
          become the tool workspace.
        </Text>
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6E7687',
    lineHeight: 22,
  },
  placeholderCard: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: '#F2F4F8',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: '#6E7687',
    lineHeight: 24,
    marginTop: 10,
  },
  placeholderText: {
    fontSize: 15,
    color: '#6E7687',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 26,
    borderRadius: 16,
    backgroundColor: '#111827',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
