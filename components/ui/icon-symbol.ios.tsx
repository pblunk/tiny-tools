import type { IconSymbolName } from '@/components/ui/icon-symbol.types';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name as unknown as Parameters<typeof SymbolView>[0]['name']}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
