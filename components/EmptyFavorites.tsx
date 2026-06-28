import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/themed-text';

export function EmptyFavorites() {
  return (
    <View style={styles.container}>
      <Ionicons name="heart-outline" size={18} color="#6B7280" />
      <Text style={styles.text}>No favorite tools yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: '#6B7280',
    marginLeft: 8,
  },
});
