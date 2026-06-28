export type IconLibrary = 'ionicons';

export type ToolIconConfig = {
  icon: string;
  library: IconLibrary;
  color: string;
  backgroundColor: string;
};

export const TOOL_ICON_MAP: Record<string, ToolIconConfig> = {
  'image-converter': {
    icon: 'image-outline',
    library: 'ionicons',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
  },
  'image-resizer': {
    icon: 'expand-outline',
    library: 'ionicons',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  'image-compressor': {
    icon: 'archive-outline',
    library: 'ionicons',
    color: '#F97316',
    backgroundColor: '#FED7AA',
  },
  'merge-pdf': {
    icon: 'documents-outline',
    library: 'ionicons',
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
  },
  'split-pdf': {
    icon: 'cut-outline',
    library: 'ionicons',
    color: '#06B6D4',
    backgroundColor: '#CFFAFE',
  },
  'text-cleaner': {
    icon: 'text-outline',
    library: 'ionicons',
    color: '#EC4899',
    backgroundColor: '#FCE7F3',
  },
  'qr-code-generator': {
    icon: 'qr-code-outline',
    library: 'ionicons',
    color: '#6366F1',
    backgroundColor: '#E0E7FF',
  },
  'prompt-improver': {
    icon: 'sparkles-outline',
    library: 'ionicons',
    color: '#A855F7',
    backgroundColor: '#F3E8FF',
  },
};

export const CATEGORY_ICON_MAP: Record<
  string,
  { icon: string; library: IconLibrary }
> = {
  All: { icon: 'apps', library: 'ionicons' },
  Images: { icon: 'image-outline', library: 'ionicons' },
  PDF: { icon: 'document-text-outline', library: 'ionicons' },
  Text: { icon: 'text-outline', library: 'ionicons' },
  Utilities: { icon: 'construct-outline', library: 'ionicons' },
  AI: { icon: 'sparkles-outline', library: 'ionicons' },
};
