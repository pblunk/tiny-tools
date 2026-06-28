import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/themed-text';
import { CategoryIcon } from '@/components/ToolIconRenderer';

export function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const backgroundColor = selected ? '#111827' : '#fff';
  const textColor = selected ? '#fff' : '#111827';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor: selected ? 'transparent' : '#E5E7EB',
          borderWidth: selected ? 0 : 1,
        },
      ]}
    >
      {label !== 'All' ? (
        <CategoryIcon category={label} size={16} color={textColor} />
      ) : (
        <Ionicons name="apps" size={16} color={textColor} />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginLeft: 6,
  },
});
