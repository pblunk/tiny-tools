import * as FileSystem from 'expo-file-system/legacy';

export type HistoryToolId = 'background-remover';

export type HistoryItem = {
  id: string;
  toolId: HistoryToolId;
  title: string;
  subtitle: string;
  createdAt: number;
  outputUri: string;
  originalUri?: string;
  mimeType: 'image/png';
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
    item.toolId === 'background-remover' &&
    typeof item.title === 'string' &&
    typeof item.subtitle === 'string' &&
    typeof item.createdAt === 'number' &&
    typeof item.outputUri === 'string' &&
    item.mimeType === 'image/png'
  );
}
