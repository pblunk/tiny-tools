import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const textColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );
  const backgroundColor = useThemeColor(
    { light: '#F3F4F6', dark: '#24282D' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#E5E7EB', dark: '#343A40' },
    'background',
  );

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <Ionicons name="search" size={20} color="#6B7280" />
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="Search tools..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 44,
    marginLeft: 10,
    paddingVertical: 10,
  },
});
