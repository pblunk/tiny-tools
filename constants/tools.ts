import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type ToolCategory = 'Images' | 'PDF' | 'Text' | 'Utilities' | 'AI';

export type Tool = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: IconSymbolName;
  favorite: boolean;
};

export const tools: Tool[] = [
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between formats quickly.',
    category: 'Images',
    icon: 'photo',
    favorite: false,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize image dimensions in seconds.',
    category: 'Images',
    icon: 'photo-size-select-small',
    favorite: false,
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress images for faster sharing.',
    category: 'Images',
    icon: 'photo-library',
    favorite: false,
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine PDF files into one document.',
    category: 'PDF',
    icon: 'picture-as-pdf',
    favorite: false,
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split long PDFs into smaller files.',
    category: 'PDF',
    icon: 'content-cut',
    favorite: false,
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    description: 'Remove formatting and clean up text.',
    category: 'Text',
    icon: 'text-fields',
    favorite: false,
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Create QR codes for links and text.',
    category: 'Utilities',
    icon: 'qr-code',
    favorite: false,
  },
  {
    id: 'prompt-improver',
    name: 'Prompt Improver',
    description: 'Refine prompts for better AI responses.',
    category: 'AI',
    icon: 'sparkles',
    favorite: false,
  },
];
