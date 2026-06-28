// Fallback for using MaterialIcons on Android and web.

import type { IconSymbolName } from '@/components/ui/icon-symbol.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<
  IconSymbolName,
  ComponentProps<typeof MaterialIcons>['name']
>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  photo: 'photo',
  'photo-size-select-small': 'photo-size-select-small',
  'photo-library': 'photo-library',
  'picture-as-pdf': 'picture-as-pdf',
  'content-cut': 'content-cut',
  'text-fields': 'text-fields',
  'qr-code': 'qr-code',
  sparkles: 'auto-awesome',
};

export type { IconSymbolName };

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
