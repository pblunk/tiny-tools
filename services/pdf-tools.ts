import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';

export type SelectedPdf = {
  id: string;
  name: string;
  uri: string;
  size?: number;
  pageCount: number;
};

export type GeneratedPdf = {
  base64: string;
  fileName: string;
  pageCount: number;
  fileSizeBytes: number;
};

const pdfMimeType = 'application/pdf';

export async function pickPdfFiles({ multiple }: { multiple: boolean }) {
  const result = await DocumentPicker.getDocumentAsync({
    type: pdfMimeType,
    multiple,
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return [];
  }

  const pdfs: SelectedPdf[] = [];

  for (const asset of result.assets) {
    if (!asset.uri) continue;

    const metadata = await readPdfMetadata(asset.uri);

    pdfs.push({
      id: `${asset.uri}-${Date.now()}-${pdfs.length}`,
      name: asset.name || 'Document.pdf',
      uri: asset.uri,
      size: asset.size,
      pageCount: metadata.pageCount,
    });
  }

  return pdfs;
}

export async function readPdfMetadata(uri: string) {
  const pdf = await loadPdf(uri);

  return {
    pageCount: pdf.getPageCount(),
  };
}

export async function mergePdfFiles(files: SelectedPdf[]) {
  const output = await PDFDocument.create();
  let pageCount = 0;

  for (const file of files) {
    const source = await loadPdf(file.uri);
    const copiedPages = await output.copyPages(source, source.getPageIndices());

    copiedPages.forEach((page) => output.addPage(page));
    pageCount += source.getPageCount();
  }

  const base64 = await output.saveAsBase64();

  return {
    base64,
    fileName: 'Merged PDF.pdf',
    pageCount,
    fileSizeBytes: estimateBase64Size(base64),
  };
}

export async function extractPdfPages({
  file,
  pageNumbers,
  expression,
}: {
  file: SelectedPdf;
  pageNumbers: number[];
  expression: string;
}) {
  const source = await loadPdf(file.uri);
  const output = await PDFDocument.create();
  const copiedPages = await output.copyPages(
    source,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );

  copiedPages.forEach((page) => output.addPage(page));

  const base64 = await output.saveAsBase64();

  return {
    base64,
    fileName: makeSplitFileName(file.name, expression),
    pageCount: pageNumbers.length,
    fileSizeBytes: estimateBase64Size(base64),
  };
}

export function parsePageExpression(expression: string, pageCount: number) {
  const trimmed = expression.replace(/\s+/g, '');

  if (!trimmed) {
    throw new Error('Enter the pages you want to extract.');
  }

  const parts = trimmed.split(',');
  const pages: number[] = [];

  for (const part of parts) {
    if (!part) {
      throw new Error('Check the page list for extra commas.');
    }

    if (part.includes('-')) {
      const range = part.split('-');

      if (range.length !== 2 || !range[0] || !range[1]) {
        throw new Error('Use ranges like 2-5.');
      }

      const start = parsePageNumber(range[0], pageCount);
      const end = parsePageNumber(range[1], pageCount);

      if (start > end) {
        throw new Error('Page ranges must go from lower to higher numbers.');
      }

      for (let page = start; page <= end; page += 1) {
        pages.push(page);
      }
    } else {
      pages.push(parsePageNumber(part, pageCount));
    }
  }

  if (pages.length === 0) {
    throw new Error('Enter at least one page to extract.');
  }

  return pages;
}

export function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return 'Size unavailable';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'PDF';
}

export async function sharePdf(uri: string, dialogTitle: string) {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    dialogTitle,
    mimeType: pdfMimeType,
    UTI: 'com.adobe.pdf',
  });
}

function parsePageNumber(value: string, pageCount: number) {
  if (!/^\d+$/.test(value)) {
    throw new Error('Use only page numbers, commas, and ranges.');
  }

  const page = Number(value);

  if (page < 1) {
    throw new Error('Page numbers start at 1.');
  }

  if (page > pageCount) {
    throw new Error(`Page ${page} is beyond this PDF's ${pageCount} pages.`);
  }

  return page;
}

async function loadPdf(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new Error('The selected PDF could not be found.');
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return await PDFDocument.load(base64);
  } catch {
    throw new Error(
      'This PDF could not be processed. It may be corrupt, unreadable, or password-protected.',
    );
  }
}

function estimateBase64Size(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;

  return Math.floor((base64.length * 3) / 4) - padding;
}

function makeSplitFileName(fileName: string, expression: string) {
  const baseName = sanitizeFileName(fileName);
  const pages = expression.replace(/\s+/g, '');

  return `${baseName} - Pages ${pages}.pdf`;
}
