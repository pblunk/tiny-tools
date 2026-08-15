import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/themed-text';
import { ToolIconWithBackground } from '@/components/ToolIconRenderer';
import { useAppState } from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  NativeBackgroundRemovalUnavailableError,
  removeImageBackground,
  type BackgroundRemovalResult,
} from '@/services/background-removal';

type Status = 'idle' | 'selected' | 'processing' | 'completed' | 'error';

export function BackgroundRemoverScreen() {
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { addBackgroundRemovalHistory } = useAppState();

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
  const mutedSurface = useThemeColor(
    { light: '#F2F4F8', dark: '#22272D' },
    'background',
  );
  const titleColor = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );

  const canProcess = Boolean(selectedImage) && status !== 'processing';
  const chooseImage = async () => {
    setMessage(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setStatus('error');
        setMessage('Photo library access is required to choose an image.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (pickerResult.canceled) {
        return;
      }

      const image = pickerResult.assets[0];

      if (!image?.uri) {
        setStatus('error');
        setMessage('That image could not be read. Please choose another file.');
        return;
      }

      setSelectedImage(image);
      setResult(null);
      setSaved(false);
      setStatus('selected');
    } catch {
      setStatus('error');
      setMessage('The image picker could not open. Please try again.');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setSaved(false);
    setMessage(null);
    setStatus('idle');
  };

  const removeBackground = async () => {
    if (!selectedImage || status === 'processing') return;

    setStatus('processing');
    setMessage('Removing the background on this device...');
    setSaved(false);

    try {
      const processed = await removeImageBackground({ image: selectedImage });
      const historyItem = await addBackgroundRemovalHistory({
        resultUri: processed.uri,
        originalUri: selectedImage.uri,
      });

      setResult({
        ...processed,
        uri: historyItem?.outputUri ?? processed.uri,
      });
      setStatus('completed');
      setMessage('Transparent PNG ready.');
    } catch (error) {
      setResult(null);
      setStatus('error');
      setMessage(getErrorMessage(error));
    }
  };

  const savePng = async () => {
    if (!result) return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true, [
        'photo',
      ]);

      if (!permission.granted) {
        setMessage('Photo save permission is required to save the PNG.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(result.uri);
      setSaved(true);
      setMessage('PNG saved to your photo library.');
    } catch {
      setMessage('The PNG could not be saved. Please try sharing it instead.');
    }
  };

  const sharePng = async () => {
    if (!result) return;

    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        setMessage('Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(result.uri, {
        dialogTitle: 'Share transparent PNG',
        mimeType: 'image/png',
        UTI: 'public.png',
      });
    } catch {
      setMessage('The PNG could not be shared. Please try again.');
    }
  };

  const showSaveNote = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Save PNG', 'Saving to the photo library is available on iOS and Android.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ToolIconWithBackground toolId="background-remover" size={62} />
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: titleColor }]}>
            Background Remover
          </Text>
          <Text style={styles.subtitle}>
            Remove the background from a photo and save it as a transparent PNG.
          </Text>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            selectedImage ? 'Replace selected image' : 'Choose image'
          }
          onPress={chooseImage}
          style={({ pressed }) => [
            styles.picker,
            { backgroundColor: mutedSurface, borderColor },
            pressed && styles.pressed,
          ]}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedPreview}
              contentFit="cover"
              accessibilityLabel="Selected original image preview"
            />
          ) : (
            <View style={styles.emptyPicker}>
              <Ionicons name="image-outline" size={36} color="#6B7280" />
              <Text style={[styles.emptyPickerTitle, { color: titleColor }]}>
                Choose Image
              </Text>
              <Text style={styles.emptyPickerText}>PNG, JPG, HEIC, or WebP</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.actionRow}>
          <Button
            label={selectedImage ? 'Replace Image' : 'Choose Image'}
            icon="image-outline"
            variant="secondary"
            onPress={chooseImage}
            accessibilityLabel="Choose image from photo library"
          />
          {selectedImage ? (
            <IconButton
              icon="close-outline"
              label="Clear selected image"
              onPress={clearImage}
            />
          ) : null}
        </View>

        <Button
          label={
            status === 'processing'
              ? 'Removing Background...'
              : 'Remove Background'
          }
          icon="color-wand-outline"
          onPress={removeBackground}
          disabled={!canProcess}
          loading={status === 'processing'}
          accessibilityLabel="Remove background from selected image"
        />

        {message ? (
          <View
            style={[
              styles.message,
              status === 'error' ? styles.errorMessage : styles.infoMessage,
            ]}
          >
            {status === 'processing' ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons
                name={status === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={20}
                color={status === 'error' ? '#B91C1C' : '#2563EB'}
              />
            )}
            <Text
              style={[
                styles.messageText,
                status === 'error' ? styles.errorText : styles.infoText,
              ]}
            >
              {message}
            </Text>
          </View>
        ) : null}
      </View>

      {selectedImage ? (
        <View style={styles.previewGrid}>
          <PreviewPanel
            title="Before"
            uri={selectedImage.uri}
            backgroundColor={cardColor}
            borderColor={borderColor}
          />
          <PreviewPanel
            title="After"
            uri={result?.uri ?? null}
            checkerboard
            backgroundColor={cardColor}
            borderColor={borderColor}
          />
        </View>
      ) : null}

      {result ? (
        <View style={[styles.panel, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.resultTitle, { color: titleColor }]}>
            {saved ? 'Saved transparent PNG' : 'Transparent PNG ready'}
          </Text>
          <View style={styles.actionRow}>
            <Button
              label="Save PNG"
              icon="download-outline"
              onPress={Platform.OS === 'web' ? showSaveNote : savePng}
              accessibilityLabel="Save transparent PNG to photo library"
            />
            <Button
              label="Share"
              icon="share-outline"
              variant="secondary"
              onPress={sharePng}
              accessibilityLabel="Share transparent PNG"
            />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function PreviewPanel({
  title,
  uri,
  checkerboard,
  backgroundColor,
  borderColor,
}: {
  title: string;
  uri: string | null;
  checkerboard?: boolean;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.previewPanel, { backgroundColor, borderColor }]}>
      <Text style={styles.previewTitle}>{title}</Text>
      <View style={styles.imageFrame}>
        {checkerboard ? <Checkerboard /> : null}
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.previewImage}
            contentFit="contain"
            accessibilityLabel={`${title} image preview`}
          />
        ) : (
          <View style={styles.pendingResult}>
            <Ionicons name="sparkles-outline" size={28} color="#6B7280" />
            <Text style={styles.pendingText}>Result preview</Text>
          </View>
        )}
      </View>
    </View>
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

function Button({
  label,
  icon,
  variant = 'primary',
  disabled,
  loading,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, busy: loading }}
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
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : secondaryText} />
      ) : (
        <Ionicons
          name={icon}
          size={20}
          color={isPrimary ? '#FFFFFF' : secondaryText}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryButtonText : { color: secondaryText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const backgroundColor = useThemeColor(
    { light: '#EEF2F7', dark: '#2A3037' },
    'background',
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={24} color="#6B7280" />
    </Pressable>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof NativeBackgroundRemovalUnavailableError) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes('REQUIRES_API_FALLBACK')) {
    return 'On-device background removal requires iOS 17 or newer. No image was uploaded.';
  }

  if (error instanceof Error && error.message.includes('not using Expo Go')) {
    return 'Background removal needs an iOS or Android development build because it uses native on-device ML.';
  }

  if (error instanceof Error) return error.message;

  return 'Background removal failed. Please try another image.';
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
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
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  picker: {
    minHeight: 230,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  emptyPicker: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  emptyPickerTitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  emptyPickerText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  selectedPreview: {
    width: '100%',
    height: 260,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  message: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoMessage: {
    backgroundColor: '#EFF6FF',
  },
  errorMessage: {
    backgroundColor: '#FEF2F2',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  infoText: {
    color: '#1D4ED8',
  },
  errorText: {
    color: '#991B1B',
  },
  previewGrid: {
    gap: 12,
  },
  previewPanel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  previewTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#6B7280',
  },
  imageFrame: {
    height: 260,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pendingResult: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pendingText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    fontWeight: '700',
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
  resultTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
});
