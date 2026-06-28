import Ionicons from '@expo/vector-icons/Ionicons';
import { OpaqueColorValue, View } from 'react-native';

import { CATEGORY_ICON_MAP, TOOL_ICON_MAP } from '@/constants/tool-icons';

export function ToolIcon({
  toolId,
  size = 24,
}: {
  toolId: string;
  size?: number;
}) {
  const config = TOOL_ICON_MAP[toolId];
  if (!config) return null;

  return (
    <Ionicons name={config.icon as any} size={size} color={config.color} />
  );
}

export function ToolIconWithBackground({
  toolId,
  size = 44,
}: {
  toolId: string;
  size?: number;
}) {
  const config = TOOL_ICON_MAP[toolId];
  if (!config) return null;

  const iconSize = Math.floor(size * 0.5);
  const borderRadius = Math.floor(size * 0.33);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: config.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ToolIcon toolId={toolId} size={iconSize} />
    </View>
  );
}

export function CategoryIcon({
  category,
  size = 20,
  color = '#11181C',
}: {
  category: string;
  size?: number;
  color?: string | OpaqueColorValue;
}) {
  const config = CATEGORY_ICON_MAP[category as keyof typeof CATEGORY_ICON_MAP];
  if (!config) return null;

  return <Ionicons name={config.icon as any} size={size} color={color} />;
}
