import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';

export type AppearancePreference = 'system' | 'light' | 'dark';

type AppStateContextValue = {
  appearance: AppearancePreference;
  setAppearance: (appearance: AppearancePreference) => void;
  colorScheme: NonNullable<ColorSchemeName>;
  favoriteIds: string[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  historySupported: boolean;
  clearHistory: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const nativeColorScheme = useNativeColorScheme();
  const [appearance, setAppearance] =
    useState<AppearancePreference>('system');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const colorScheme =
    appearance === 'system' ? nativeColorScheme ?? 'light' : appearance;

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
      historySupported: false,
      clearHistory: () => {},
    }),
    [appearance, colorScheme, favoriteIds],
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
