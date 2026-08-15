import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';

import {
  clearHistoryStorage,
  deleteHistoryFile,
  HistoryItem,
  isHistoryStorageAvailable,
  loadHistoryItems,
  persistHistoryItems,
  persistHistoryPng,
} from '@/services/history-storage';

export type AppearancePreference = 'system' | 'light' | 'dark';

type AppStateContextValue = {
  appearance: AppearancePreference;
  setAppearance: (appearance: AppearancePreference) => void;
  colorScheme: NonNullable<ColorSchemeName>;
  favoriteIds: string[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  historyItems: HistoryItem[];
  historySupported: boolean;
  getHistoryItem: (id: string) => HistoryItem | undefined;
  addBackgroundRemovalHistory: (input: {
    resultUri: string;
    originalUri?: string;
  }) => Promise<HistoryItem | null>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const nativeColorScheme = useNativeColorScheme();
  const [appearance, setAppearance] =
    useState<AppearancePreference>('system');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const historySupported = isHistoryStorageAvailable();

  const colorScheme =
    appearance === 'system' ? nativeColorScheme ?? 'light' : appearance;

  useEffect(() => {
    let mounted = true;

    if (!historySupported) {
      return;
    }

    loadHistoryItems()
      .then((items) => {
        if (mounted) {
          setHistoryItems(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setHistoryItems([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [historySupported]);

  const addBackgroundRemovalHistory = useCallback(
    async ({
      resultUri,
      originalUri,
    }: {
      resultUri: string;
      originalUri?: string;
    }) => {
      if (!historySupported) {
        return null;
      }

      const createdAt = Date.now();
      const outputUri = await persistHistoryPng(resultUri);
      const item: HistoryItem = {
        id: `background-remover-${createdAt}`,
        toolId: 'background-remover',
        title: 'Background Remover',
        subtitle: 'Transparent PNG',
        createdAt,
        outputUri,
        originalUri,
        mimeType: 'image/png',
      };
      const next = [item, ...historyItems];

      await persistHistoryItems(next);
      setHistoryItems(next);

      return item;
    },
    [historyItems, historySupported],
  );

  const getHistoryItem = useCallback(
    (id: string) => historyItems.find((item) => item.id === id),
    [historyItems],
  );

  const deleteHistoryItem = useCallback(
    async (id: string) => {
      if (!historySupported) {
        return;
      }

      const item = historyItems.find((current) => current.id === id);
      const next = historyItems.filter((current) => current.id !== id);

      await persistHistoryItems(next);

      if (item) {
        await deleteHistoryFile(item.outputUri);
      }

      setHistoryItems(next);
    },
    [historyItems, historySupported],
  );

  const clearHistory = useCallback(async () => {
    if (!historySupported) {
      return;
    }

    await clearHistoryStorage();
    setHistoryItems([]);
  }, [historySupported]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      appearance,
      setAppearance,
      colorScheme,
      favoriteIds,
      isFavorite: (toolId) => favoriteIds.includes(toolId),
      toggleFavorite: (toolId) => {
        setFavoriteIds((current) =>
          current.includes(toolId)
            ? current.filter((id) => id !== toolId)
            : [...current, toolId],
        );
      },
      historyItems,
      historySupported,
      getHistoryItem,
      addBackgroundRemovalHistory,
      deleteHistoryItem,
      clearHistory,
    }),
    [
      addBackgroundRemovalHistory,
      appearance,
      clearHistory,
      colorScheme,
      deleteHistoryItem,
      favoriteIds,
      getHistoryItem,
      historyItems,
      historySupported,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}

export function useAppColorScheme() {
  return useAppState().colorScheme;
}
