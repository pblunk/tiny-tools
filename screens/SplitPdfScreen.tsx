import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/themed-text';
import { ToolIconWithBackground } from '@/components/ToolIconRenderer';
import { useAppState } from '@/hooks/use-app-state';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  extractPdfPages,
  formatFileSize,
  parsePageExpression,
  pickPdfFiles,
  sharePdf,
  type SelectedPdf,
} from '@/services/pdf-tools';
import type { HistoryItem } from '@/services/history-storage';

type Status = 'idle' | 'processing' | 'completed' | 'error';

export function SplitPdfScreen() {
  const [file, setFile] = useState<SelectedPdf | null>(null);
  const [pageExpression, setPageExpression] = useState('');
  const [result, setResult] = useState<HistoryItem | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const { addPdfHistory } = useAppState();

  const colors = useToolColors();
  const isProcessing = status === 'processing';
  const canExtract = Boolean(file && pageExpression.trim()) && !isProcessing;

  const choosePdf = async () => {
    if (isProcessing) return;

    setMessage(null);

    try {
      const pickedFiles = await pickPdfFiles({ multiple: false });

      if (pickedFiles.length === 0) {
        return;
      }

      setFile(pickedFiles[0]);
      setPageExpression('');
      setResult(null);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(getMessage(error, 'That PDF could not be read.'));
    }
  };

  const extract = async () => {
    if (!file || !canExtract) return;

    setStatus('processing');
    setMessage('Extracting pages on this device...');

    try {
      const pageNumbers = parsePageExpression(pageExpression, file.pageCount);
      const generatedPdf = await extractPdfPages({
        file,
        pageNumbers,
        expression: pageExpression,
      });
      const historyItem = await addPdfHistory({
        toolId: 'split-pdf',
        generatedPdf,
        subtitle: `${generatedPdf.pageCount} pages extracted`,
        originalUri: file.uri,
      });

      if (!historyItem) {
        throw new Error('The extracted PDF could not be saved to TinyTools History.');
      }

      setResult(historyItem);
      setStatus('completed');
      setMessage('Extracted PDF created.');
    } catch (error) {
      setResult(null);
      setStatus('error');
      setMessage(getMessage(error, 'The pages could not be extracted.'));
    }
  };

  const startOver = () => {
    setFile(null);
    setPageExpression('');
    setResult(null);
    setStatus('idle');
    setMessage(null);
  };

  const exportPdf = async (label: 'Save' | 'Share') => {
    if (!result) return;

    try {
      await sharePdf(
        result.outputUri,
        label === 'Save' ? 'Save extracted PDF' : 'Share extracted PDF',
      );
      setMessage(
        label === 'Save'
          ? 'Choose Save to Files from the sheet to export the PDF.'
          : 'Extracted PDF ready to share.',
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
      <View style={styles.header}>
        <ToolIconWithBackground toolId="split-pdf" size={62} />
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.titleColor }]}>
            Split PDF
          </Text>
          <Text style={styles.subtitle}>
            Extract selected pages from one PDF into a new document.
          </Text>
        </View>
      </View>

      <View style={[styles.panel, colors.panel]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={file ? 'Replace selected PDF' : 'Choose PDF'}
          disabled={isProcessing}
          onPress={choosePdf}
          style={({ pressed }) => [
            styles.picker,
            { backgroundColor: colors.mutedSurface, borderColor: colors.borderColor },
            pressed && styles.pressed,
            isProcessing && styles.disabled,
          ]}
        >
          <Ionicons name="document-text-outline" size={36} color="#B91C1C" />
          <Text style={[styles.emptyTitle, { color: colors.titleColor }]}>
            {file ? file.name : 'Choose PDF'}
          </Text>
          <Text style={styles.mutedText}>
            {file
              ? `${file.pageCount} pages · ${formatFileSize(file.size)}`
              : 'Select one PDF file'}
          </Text>
        </Pressable>

        <Button
          label={file ? 'Replace PDF' : 'Choose PDF'}
          icon="document-attach-outline"
          variant="secondary"
          onPress={choosePdf}
          disabled={isProcessing}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.titleColor }]}>
            Pages to extract
          </Text>
          <TextInput
            value={pageExpression}
            onChangeText={(value) => {
              setPageExpression(value);
              setResult(null);
              if (status !== 'processing') {
                setStatus('idle');
                setMessage(null);
              }
            }}
            editable={!isProcessing}
            placeholder="1, 3, 5-8"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            style={[
              styles.input,
              {
                backgroundColor: colors.mutedSurface,
                borderColor: colors.borderColor,
                color: colors.titleColor,
              },
            ]}
          />
          <Text style={styles.mutedText}>
            Use commas and ranges, for example 1,3,5-8.
          </Text>
        </View>

        <Button
          label={isProcessing ? 'Extracting Pages...' : 'Extract Pages'}
          icon="cut-outline"
          onPress={extract}
          disabled={!canExtract}
          loading={isProcessing}
        />

        {message ? <Message status={status} message={message} /> : null}
      </View>

      {result ? (
        <ResultPanel
          title="Extracted PDF created"
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
    textAlign: 'center',
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  fileInfo: {
    flex: 1,
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
