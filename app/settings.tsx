import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/themed-text';
import {
  AppearancePreference,
  useAppState,
} from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';

const appearanceOptions: {
  label: string;
  value: AppearancePreference;
}[] = [
  { label: 'System default', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { appearance, setAppearance, historySupported, clearHistory } =
    useAppState();
  const backgroundColor = useThemeColor(
    { light: '#F9FAFB', dark: '#0F1215' },
    'background',
  );
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
  const appVersion = Constants.expoConfig?.version ?? 'Unknown';

  const handleClearHistory = () => {
    if (!historySupported) {
      return;
    }

    Alert.alert(
      'Clear history?',
      'This will remove all recent tool activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear history',
          style: 'destructive',
          onPress: clearHistory,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={24} color={titleColor} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: titleColor }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Appearance
          </Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {appearanceOptions.map((option, index) => {
              const selected = appearance === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setAppearance(option.value)}
                  style={[
                    styles.row,
                    index < appearanceOptions.length - 1 && [
                      styles.rowBorder,
                      { borderBottomColor: borderColor },
                    ],
                  ]}
                >
                  <Text style={[styles.rowLabel, { color: titleColor }]}>
                    {option.label}
                  </Text>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selected ? '#0a7ea4' : '#9CA3AF'}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            About
          </Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <View
              style={[
                styles.detailRow,
                styles.rowBorder,
                { borderBottomColor: borderColor },
              ]}
            >
              <Text style={styles.detailLabel}>App name</Text>
              <Text style={[styles.detailValue, { color: titleColor }]}>
                TinyTools
              </Text>
            </View>
            <View
              style={[
                styles.detailRow,
                styles.rowBorder,
                { borderBottomColor: borderColor },
              ]}
            >
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, { color: titleColor }]}>
                Simple tools. Done instantly.
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Version</Text>
              <Text style={[styles.detailValue, { color: titleColor }]}>
                {appVersion}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            Data
          </Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !historySupported }}
              disabled={!historySupported}
              onPress={handleClearHistory}
              style={styles.row}
            >
              <View style={styles.rowText}>
                <Text
                  style={[
                    styles.rowLabel,
                    { color: historySupported ? titleColor : '#9CA3AF' },
                  ]}
                >
                  Clear history
                </Text>
                {!historySupported ? (
                  <Text style={styles.rowDescription}>
                    History storage is not available yet.
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name="trash-outline"
                size={21}
                color={historySupported ? '#EF4444' : '#9CA3AF'}
              />
            </Pressable>
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
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -6,
  },
  container: {
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
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  rowDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  detailRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
});
