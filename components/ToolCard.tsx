import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/themed-text';
import { ToolIconWithBackground } from '@/components/ToolIconRenderer';
import type { Tool } from '@/constants/tools';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ToolCard({
  tool,
  favorite,
  onToggleFavorite,
  onPress,
}: {
  tool: Tool;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  const cardColor = useThemeColor(
    { light: '#FFFFFF', dark: '#181B1E' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#343A40' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );

  return (
    <View
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${tool.name}. ${tool.description}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.mainAction,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.iconWrapper}>
          <ToolIconWithBackground toolId={tool.id} size={46} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: titleColor }]}>{tool.name}</Text>
          <Text style={styles.description}>{tool.description}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          favorite
            ? `Remove ${tool.name} from favorites`
            : `Add ${tool.name} to favorites`
        }
        hitSlop={4}
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        style={styles.favoriteButton}
      >
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={22}
          color={favorite ? '#EC4899' : '#6B7280'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 84,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  mainAction: {
    flex: 1,
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingVertical: 12,
  },
  cardPressed: {
    opacity: 0.72,
  },
  iconWrapper: {
    marginRight: 14,
  },
  content: {
    flex: 1,
    paddingVertical: 1,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 6,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
