import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/themed-text';
import { useAppState } from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import { historyFileExists } from '@/services/history-storage';

type FileStatus = 'checking' | 'available' | 'missing';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getHistoryItem, deleteHistoryItem } = useAppState();
  const item = useMemo(() => getHistoryItem(id), [getHistoryItem, id]);
  const [fileStatus, setFileStatus] = useState<FileStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;

    if (!item) {
      setFileStatus('missing');
      return;
    }

    setFileStatus('checking');
    historyFileExists(item.outputUri)
      .then((exists) => {
        if (mounted) {
          setFileStatus(exists ? 'available' : 'missing');
        }
      })
      .catch(() => {
        if (mounted) {
          setFileStatus('missing');
        }
      });

    return () => {
      mounted = false;
    };
  }, [item]);

  const savePng = async () => {
    if (!item || fileStatus !== 'available') return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true, [
        'photo',
      ]);

      if (!permission.granted) {
        setMessage('Photo save permission is required to save the PNG.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(item.outputUri);
      setMessage('PNG saved to your photo library.');
    } catch {
      setMessage('The PNG could not be saved. Please try sharing it instead.');
    }
  };

  const sharePng = async () => {
    if (!item || fileStatus !== 'available') return;

    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        setMessage('Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(item.outputUri, {
        dialogTitle: 'Share transparent PNG',
        mimeType: 'image/png',
        UTI: 'public.png',
      });
    } catch {
      setMessage('The PNG could not be shared. Please try again.');
    }
  };

  const deleteItem = () => {
    if (!item) return;

    Alert.alert(
      'Delete from History?',
      'This removes the saved result from TinyTools History.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHistoryItem(item.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{ title: item?.title ?? 'History Result' }}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: titleColor }]}>
          {item?.title ?? 'History Result'}
        </Text>
        {item ? (
          <Text style={styles.subtitle}>{formatHistoryDate(item.createdAt)}</Text>
        ) : null}
      </View>

      <View style={[styles.previewPanel, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.imageFrame}>
          {fileStatus === 'checking' ? (
            <View style={styles.centerState}>
              <ActivityIndicator />
              <Text style={styles.centerText}>Checking saved file...</Text>
            </View>
          ) : fileStatus === 'available' && item ? (
            <>
              <Checkerboard />
              <Image
                source={{ uri: item.outputUri }}
                style={styles.previewImage}
                contentFit="contain"
                accessibilityLabel={`${item.title} saved result preview`}
              />
            </>
          ) : (
            <View style={styles.centerState}>
              <Ionicons name="alert-circle-outline" size={28} color="#6B7280" />
              <Text style={[styles.missingTitle, { color: titleColor }]}>
                File no longer available
              </Text>
              <Text style={styles.centerText}>
                This saved result could not be found on this device.
              </Text>
            </View>
          )}
        </View>
      </View>

      {message ? (
        <View style={styles.message}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.actionRow}>
          <Button
            label="Save PNG"
            icon="download-outline"
            onPress={savePng}
            disabled={fileStatus !== 'available'}
            accessibilityLabel="Save transparent PNG to photo library"
          />
          <Button
            label="Share"
            icon="share-outline"
            variant="secondary"
            onPress={sharePng}
            disabled={fileStatus !== 'available'}
            accessibilityLabel="Share transparent PNG"
          />
        </View>
        <View style={styles.deleteRow}>
          <Button
            label="Delete"
            icon="trash-outline"
            variant="danger"
            onPress={deleteItem}
            disabled={!item}
            accessibilityLabel="Delete result from history"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Button({
  label,
  icon,
  variant = 'primary',
  disabled,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const isPrimary = variant === 'primary';
  const secondaryBackground = useThemeColor(
    { light: '#EEF2F7', dark: '#2A3037' },
    'background',
  );
  const secondaryText = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );
  const color = isPrimary
    ? '#FFFFFF'
    : variant === 'danger'
      ? '#B91C1C'
      : secondaryText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? styles.primaryButton
          : { backgroundColor: secondaryBackground },
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryButtonText : { color },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Checkerboard() {
  return (
    <View style={styles.checkerboard} pointerEvents="none">
      {Array.from({ length: 96 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.checkerSquare,
            index % 2 === Math.floor(index / 12) % 2
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
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 42,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    color: '#6E7687',
    lineHeight: 22,
  },
  previewPanel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  imageFrame: {
    height: 360,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  centerState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  missingTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    textAlign: 'center',
  },
  centerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  checkerboard: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkerSquare: {
    width: '8.333333%',
    height: '12.5%',
  },
  checkerLight: {
    backgroundColor: '#FFFFFF',
  },
  checkerDark: {
    backgroundColor: '#D1D5DB',
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#111827',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  message: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1D4ED8',
  },
});
