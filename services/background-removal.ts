import type { ImagePickerAsset } from 'expo-image-picker';

export type BackgroundRemovalInput = {
  image: ImagePickerAsset;
};

export type BackgroundRemovalResult = {
  filename: string;
  mimeType: 'image/png';
  pngBase64: string;
};

const endpoint = process.env.EXPO_PUBLIC_BACKGROUND_REMOVAL_ENDPOINT;

export class BackgroundRemovalConfigurationError extends Error {
  constructor() {
    super(
      'Background removal needs a secure backend endpoint before processing can run.',
    );
    this.name = 'BackgroundRemovalConfigurationError';
  }
}

export async function removeImageBackground({
  image,
}: BackgroundRemovalInput): Promise<BackgroundRemovalResult> {
  if (!endpoint) {
    throw new BackgroundRemovalConfigurationError();
  }

  if (!image.uri) {
    throw new Error('The selected image does not include a readable file URI.');
  }

  const fileName = image.fileName ?? `tinytools-source-${Date.now()}.jpg`;
  const mimeType = image.mimeType ?? guessMimeType(fileName);
  const formData = new FormData();

  if (image.file) {
    formData.append('image', image.file);
  } else {
    formData.append('image', {
      uri: image.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'image/png, application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await getProviderErrorMessage(response));
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as {
      pngBase64?: string;
      imageBase64?: string;
      filename?: string;
      mimeType?: string;
    };
    const pngBase64 = payload.pngBase64 ?? payload.imageBase64;

    if (!pngBase64) {
      throw new Error('The backend did not return a PNG image payload.');
    }

    return {
      filename: payload.filename ?? makeOutputFilename(),
      mimeType: 'image/png',
      pngBase64: stripDataUriPrefix(pngBase64),
    };
  }

  const pngBlob = await response.blob();

  if (pngBlob.type && !pngBlob.type.includes('png')) {
    throw new Error('The backend returned a file that was not a PNG image.');
  }

  return {
    filename: makeOutputFilename(),
    mimeType: 'image/png',
    pngBase64: await blobToBase64(pngBlob),
  };
}

export function makeOutputFilename() {
  return `tinytools-background-removed-${Date.now()}.png`;
}

function guessMimeType(fileName: string) {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.heic')) return 'image/heic';
  if (normalized.endsWith('.heif')) return 'image/heif';

  return 'image/jpeg';
}

async function getProviderErrorMessage(response: Response) {
  const fallback =
    response.status >= 500
      ? 'The background removal service is unavailable. Please try again later.'
      : 'The background removal request failed. Try another image or check the backend setup.';

  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error ?? payload.message ?? fallback;
  } catch {
    return fallback;
  }
}

function stripDataUriPrefix(value: string) {
  return value.replace(/^data:image\/png;base64,/, '');
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('The processed PNG could not be read.'));
    };
    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('The processed PNG was not returned as a readable file.'));
        return;
      }

      resolve(stripDataUriPrefix(result));
    };
    reader.readAsDataURL(blob);
  });
}
