import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
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
  formatFileSize,
  mergePdfFiles,
  pickPdfFiles,
  sharePdf,
  type SelectedPdf,
} from '@/services/pdf-tools';
import type { HistoryItem } from '@/services/history-storage';

type Status = 'idle' | 'processing' | 'completed' | 'error';

export function MergePdfScreen() {
  const [files, setFiles] = useState<SelectedPdf[]>([]);
  const [result, setResult] = useState<HistoryItem | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const { addPdfHistory } = useAppState();

  const colors = useToolColors();
  const isProcessing = status === 'processing';
  const canMerge = files.length >= 2 && !isProcessing;

  const addFiles = async () => {
    if (isProcessing) return;

    setMessage(null);

    try {
      const pickedFiles = await pickPdfFiles({ multiple: true });

      if (pickedFiles.length === 0) {
        return;
      }

      setFiles((current) => [...current, ...pickedFiles]);
      setResult(null);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(getMessage(error, 'Those PDFs could not be read.'));
    }
  };

  const merge = async () => {
    if (!canMerge) return;

    setStatus('processing');
    setMessage('Merging PDFs on this device...');

    try {
      const generatedPdf = await mergePdfFiles(files);
      const historyItem = await addPdfHistory({
        toolId: 'merge-pdf',
        generatedPdf,
        subtitle: `${generatedPdf.pageCount} pages`,
      });

      if (!historyItem) {
        throw new Error('The merged PDF could not be saved to TinyTools History.');
      }

      setResult(historyItem);
      setStatus('completed');
      setMessage('Merged PDF created.');
    } catch (error) {
      setResult(null);
      setStatus('error');
      setMessage(getMessage(error, 'The PDFs could not be merged.'));
    }
  };

  const startOver = () => {
    setFiles([]);
    setResult(null);
    setStatus('idle');
    setMessage(null);
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
    setResult(null);
  };

  const moveFile = (id: string, direction: -1 | 1) => {
    setFiles((current) => {
      const index = current.findIndex((file) => file.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [file] = next.splice(index, 1);
      next.splice(nextIndex, 0, file);

      return next;
    });
    setResult(null);
  };

  const exportPdf = async (label: 'Save' | 'Share') => {
    if (!result) return;

    try {
      await sharePdf(
        result.outputUri,
        label === 'Save' ? 'Save merged PDF' : 'Share merged PDF',
      );
      setMessage(
        label === 'Save'
          ? 'Choose Save to Files from the sheet to export the PDF.'
          : 'Merged PDF ready to share.',
      );
    } catch (error) {
      setMessage(getMessage(error, 'The PDF could not be exported.'));
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.backgroundColor }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ToolHeader
        toolId="merge-pdf"
        title="Merge PDF"
        description="Combine PDF files into one document in the order you choose."
        titleColor={colors.titleColor}
      />

      <View style={[styles.panel, colors.panel]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose PDF files"
          disabled={isProcessing}
          onPress={addFiles}
          style={({ pressed }) => [
            styles.picker,
            { backgroundColor: colors.mutedSurface, borderColor: colors.borderColor },
            pressed && styles.pressed,
            isProcessing && styles.disabled,
          ]}
        >
          <Ionicons name="documents-outline" size={36} color="#6B7280" />
          <Text style={[styles.emptyTitle, { color: colors.titleColor }]}>
            Choose PDFs
          </Text>
          <Text style={styles.mutedText}>Select two or more PDF files</Text>
        </Pressable>

        <Button
          label={files.length > 0 ? 'Add More PDFs' : 'Choose PDFs'}
          icon="add-outline"
          variant="secondary"
          onPress={addFiles}
          disabled={isProcessing}
        />

        {files.length > 0 ? (
          <View style={styles.fileList}>
            {files.map((file, index) => (
              <PdfFileRow
                key={file.id}
                file={file}
                index={index}
                count={files.length}
                titleColor={colors.titleColor}
                borderColor={colors.borderColor}
                onRemove={() => removeFile(file.id)}
                onMoveUp={() => moveFile(file.id, -1)}
                onMoveDown={() => moveFile(file.id, 1)}
                disabled={isProcessing}
              />
            ))}
          </View>
        ) : null}

        <Button
          label={isProcessing ? 'Merging PDFs...' : 'Merge PDFs'}
          icon="git-merge-outline"
          onPress={merge}
          disabled={!canMerge}
          loading={isProcessing}
        />

        {message ? <Message status={status} message={message} /> : null}
      </View>

      {result ? (
        <ResultPanel
          title="Merged PDF created"
          item={result}
          colors={colors}
          onSave={() => exportPdf('Save')}
          onShare={() => exportPdf('Share')}
          onStartOver={startOver}
        />
      ) : null}
    </ScrollView>
  );
}

function ToolHeader({
  toolId,
  title,
  description,
  titleColor,
}: {
  toolId: string;
  title: string;
  description: string;
  titleColor: string;
}) {
  return (
    <View style={styles.header}>
      <ToolIconWithBackground toolId={toolId} size={62} />
      <View style={styles.titleGroup}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
    </View>
  );
}

function PdfFileRow({
  file,
  index,
  count,
  titleColor,
  borderColor,
  disabled,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  file: SelectedPdf;
  index: number;
  count: number;
  titleColor: string;
  borderColor: string;
  disabled: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <View style={[styles.fileRow, { borderColor }]}>
      <View style={styles.fileIcon}>
        <Ionicons name="document-text-outline" size={24} color="#B91C1C" />
      </View>
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: titleColor }]} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.mutedText}>
          {file.pageCount} pages · {formatFileSize(file.size)}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <IconButton
          icon="arrow-up-outline"
          label="Move PDF up"
          onPress={onMoveUp}
          disabled={disabled || index === 0}
        />
        <IconButton
          icon="arrow-down-outline"
          label="Move PDF down"
          onPress={onMoveDown}
          disabled={disabled || index === count - 1}
        />
        <IconButton
          icon="close-outline"
          label="Remove PDF"
          onPress={onRemove}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function ResultPanel({
  title,
  item,
  colors,
  onSave,
  onShare,
  onStartOver,
}: {
  title: string;
  item: HistoryItem;
  colors: ReturnType<typeof useToolColors>;
  onSave: () => void;
  onShare: () => void;
  onStartOver: () => void;
}) {
  return (
    <View style={[styles.panel, colors.panel]}>
      <View style={styles.resultHeader}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#2563EB" />
        <View style={styles.fileInfo}>
          <Text style={[styles.resultTitle, { color: colors.titleColor }]}>
            {title}
          </Text>
          <Text style={styles.mutedText}>{item.fileName}</Text>
          <Text style={styles.mutedText}>
            {item.pageCount} pages · {formatFileSize(item.fileSizeBytes)}
          </Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Button label="Save PDF" icon="download-outline" onPress={onSave} />
        <Button
          label="Share"
          icon="share-outline"
          variant="secondary"
          onPress={onShare}
        />
      </View>
      <Button
        label="Start Over"
        icon="refresh-outline"
        variant="secondary"
        onPress={onStartOver}
      />
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
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const secondaryBackground = useThemeColor(
    { light: '#EEF2F7', dark: '#2A3037' },
    'background',
  );
  const secondaryText = useThemeColor(
    { light: '#111827', dark: '#ECEDEE' },
    'text',
  );
  const isPrimary = variant === 'primary';
  const color = isPrimary ? '#FFFFFF' : secondaryText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? styles.primaryButton
          : { backgroundColor: secondaryBackground },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={20} color={color} />
      )}
      <Text style={[styles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function IconButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={18} color="#6B7280" />
    </Pressable>
  );
}

function Message({ status, message }: { status: Status; message: string }) {
  const isError = status === 'error';

  return (
    <View style={[styles.message, isError ? styles.errorMessage : styles.infoMessage]}>
      {status === 'processing' ? (
        <ActivityIndicator size="small" color="#2563EB" />
      ) : (
        <Ionicons
          name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          size={20}
          color={isError ? '#B91C1C' : '#2563EB'}
        />
      )}
      <Text style={[styles.messageText, isError ? styles.errorText : styles.infoText]}>
        {message}
      </Text>
    </View>
  );
}

function useToolColors() {
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

  return {
    backgroundColor,
    borderColor,
    mutedSurface,
    titleColor,
    panel: {
      backgroundColor: cardColor,
      borderColor,
    },
  };
}

function getMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
  },
  titleGroup: {
    flex: 1,
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
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  picker: {
    minHeight: 148,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  fileList: {
    gap: 10,
  },
  fileRow: {
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
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
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.45,
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
    color: '#B91C1C',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  resultTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
});
