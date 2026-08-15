import * as FileSystem from 'expo-file-system/legacy';

import { sanitizeFileName } from '@/services/pdf-tools';

export type HistoryToolId = 'background-remover' | 'merge-pdf' | 'split-pdf';

export type HistoryItem = {
  id: string;
  toolId: HistoryToolId;
  title: string;
  subtitle: string;
  createdAt: number;
  outputUri: string;
  fileName?: string;
  pageCount?: number;
  fileSizeBytes?: number;
  originalUri?: string;
  mimeType: 'image/png' | 'application/pdf';
};

const historyDirectory = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}tinytools-history/`
  : null;
const historyIndexUri = historyDirectory
  ? `${historyDirectory}history.json`
  : null;

export function isHistoryStorageAvailable() {
  return Boolean(historyDirectory && historyIndexUri);
}

export async function loadHistoryItems() {
  if (!historyIndexUri) return [];

  await ensureHistoryDirectory();

  const indexInfo = await FileSystem.getInfoAsync(historyIndexUri);

  if (!indexInfo.exists) {
    return [];
  }

  const payload = await FileSystem.readAsStringAsync(historyIndexUri);
  const parsed = JSON.parse(payload) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isHistoryItem);
}

export async function persistHistoryItems(items: HistoryItem[]) {
  if (!historyIndexUri) return;

  await ensureHistoryDirectory();
  await FileSystem.writeAsStringAsync(historyIndexUri, JSON.stringify(items));
}

export async function historyFileExists(uri: string) {
  const fileInfo = await FileSystem.getInfoAsync(uri);

  return fileInfo.exists;
}

export async function persistHistoryPng(sourceUri: string) {
  if (!historyDirectory) {
    throw new Error('History storage is not available on this platform.');
  }

  await ensureHistoryDirectory();

  const destinationUri = `${historyDirectory}${makeHistoryPngFilename()}`;
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
}

export async function persistHistoryPdfBase64({
  base64,
  fileName,
}: {
  base64: string;
  fileName: string;
}) {
  if (!historyDirectory) {
    throw new Error('History storage is not available on this platform.');
  }

  await ensureHistoryDirectory();

  const destinationUri = `${historyDirectory}${makeHistoryPdfFilename(fileName)}`;
  await FileSystem.writeAsStringAsync(destinationUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return destinationUri;
}

export async function clearHistoryStorage() {
  if (!historyDirectory) return;

  const directoryInfo = await FileSystem.getInfoAsync(historyDirectory);

  if (directoryInfo.exists) {
    await FileSystem.deleteAsync(historyDirectory, { idempotent: true });
  }

  await ensureHistoryDirectory();
}

export async function deleteHistoryFile(uri: string) {
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

function makeHistoryPngFilename() {
  return `background-remover-${Date.now()}.png`;
}

function makeHistoryPdfFilename(fileName: string) {
  return `${Date.now()}-${sanitizeFileName(fileName)}.pdf`;
}

async function ensureHistoryDirectory() {
  if (!historyDirectory) return;

  const directoryInfo = await FileSystem.getInfoAsync(historyDirectory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(historyDirectory, {
      intermediates: true,
    });
  }
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<HistoryItem>;

  return (
    typeof item.id === 'string' &&
    isHistoryToolId(item.toolId) &&
    typeof item.title === 'string' &&
    typeof item.subtitle === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.outputUri === 'string' &&
    (item.mimeType === 'image/png' || item.mimeType === 'application/pdf')
  );
}

function isHistoryToolId(value: unknown): value is HistoryToolId {
  return (
    value === 'background-remover' ||
    value === 'merge-pdf' ||
    value === 'split-pdf'
  );
}
