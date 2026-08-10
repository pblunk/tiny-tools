# Background Remover Backend

The Expo app never calls a background-removal provider with a secret key. It only posts the selected image to the URL in `EXPO_PUBLIC_BACKGROUND_REMOVAL_ENDPOINT`.

## Endpoint Contract

`POST /remove-background`

Request:

- `multipart/form-data`
- Field name: `image`
- Value: the selected source image

Successful responses can use either format:

- `Content-Type: image/png` with the transparent PNG as the response body.
- `Content-Type: application/json` with:

```json
{
  "pngBase64": "iVBORw0KGgo...",
  "filename": "tinytools-background-removed-1710000000000.png"
}
```

Error responses should return a useful status code and either:

```json
{
  "error": "The image format is not supported."
}
```

or:

```json
{
  "message": "The background removal provider is unavailable."
}
```

## Required Environment Variables

Client app:

- `EXPO_PUBLIC_BACKGROUND_REMOVAL_ENDPOINT`: HTTPS URL for your secure backend endpoint.

Backend:

- Provider-specific secret API keys, stored only in the backend or serverless function environment.

## Backend Requirements

- Validate MIME type and file size before forwarding the image to a provider.
- Keep provider API keys out of the React Native bundle and Expo config.
- Delete temporary source and result files after the request completes.
- Return a transparent PNG.
- Avoid retaining uploaded images unless your privacy policy and provider setup explicitly allow it.
