import {
  removeBackground,
} from '@six33/react-native-bg-removal';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export type BackgroundRemovalInput = {
  image: ImagePickerAsset;
};

export type BackgroundRemovalResult = {
  filename: string;
  mimeType: 'image/png';
  uri: string;
};

export class NativeBackgroundRemovalUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NativeBackgroundRemovalUnavailableError';
  }
}

export async function removeImageBackground({
  image,
}: BackgroundRemovalInput): Promise<BackgroundRemovalResult> {
  if (!image.uri) {
    throw new Error('The selected image does not include a readable file URI.');
  }

  if (Platform.OS === 'web') {
    throw new NativeBackgroundRemovalUnavailableError(
      'Background removal runs on-device in the iOS and Android apps. Web is not supported.',
    );
  }

  const uri = await removeBackground(image.uri, { trim: false });

  if (!uri) {
    throw new Error('The native background remover did not return a PNG file.');
  }

  if (Platform.OS === 'ios' && uri === image.uri) {
    throw new NativeBackgroundRemovalUnavailableError(
      'iOS background removal requires a physical device. The simulator cannot process this image.',
    );
  }

  return {
    filename: getFilenameFromUri(uri),
    mimeType: 'image/png',
    uri,
  };
}

function getFilenameFromUri(uri: string) {
  const withoutQuery = uri.split('?')[0];
  const filename = withoutQuery.split('/').pop();

  return filename && filename.toLowerCase().endsWith('.png')
    ? filename
    : makeOutputFilename();
}

export function makeOutputFilename() {
  return `tinytools-background-removed-${Date.now()}.png`;
}
