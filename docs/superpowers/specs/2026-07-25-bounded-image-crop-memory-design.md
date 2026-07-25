# Bounded Image Upload and Crop Memory Design

## Context

The current upload pipeline reads the selected file into a Base64 data URL,
keeps that original string through the crop flow, and stores both the original
and cropped PNG strings in application state. Cropping first draws the complete
source image into a full-resolution canvas and then draws the selected area into
a second canvas.

This makes memory consumption depend on the camera's source resolution rather
than the application's fixed 480×900 photo area. A 12-megapixel source requires
about 48 MB for one raw RGBA canvas before the source image, second canvas,
Base64 strings, browser decoding, and PNG encoding overhead are counted.

The application has no recrop action after confirmation and excludes photos
from presets and serialized state. Keeping the original image after a crop is
therefore unnecessary.

## Goals

1. Avoid Base64 copies of uploaded source files.
2. Remove the full-source intermediate crop canvas.
3. Limit cropped PNG output to 1440×2700 without upscaling smaller crops.
4. Retain enough resolution for the existing 3× desktop PNG export.
5. Release every application-created object URL after replacement, cancellation,
   failure, or unmount.
6. Reject unsupported or excessively large files before opening the crop modal.
7. Prevent duplicate crop work and provide recoverable inline errors.
8. Preserve the current crop interaction, 480:900 aspect ratio, preview layout,
   presets, and export flow.

## Non-goals

- Adding recrop history or nondestructive editing.
- Persisting photos in presets, URLs, or local storage.
- Adding rotation or flip controls.
- Moving the crop UI to a Worker or `OffscreenCanvas`.
- Changing the 1080×900 glamour card layout.
- Supporting animated images or SVG uploads.
- Redesigning the crop modal.

## Chosen Approach

Use object URLs for the pending source and final cropped Blob, plus a one-pass
bounded crop.

Alternatives were rejected:

- Keeping the final result as Base64 is simpler but retains its string-copy and
  garbage-collection cost.
- Keeping the current two-canvas algorithm while only limiting output still
  allocates a source-sized intermediate canvas.
- A Worker-based renderer adds browser and bundling complexity while the crop
  interaction and image decode remain connected to the main document.

## Upload Contract

The accepted MIME types are:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/avif`

The file-size limit is exactly 25 MiB (`25 * 1024 * 1024` bytes). Files with an
unsupported type or a larger size are rejected before an object URL is created.
The file input `accept` attribute will match this allowlist.

`useImageUpload` will expose:

- the current pending source URL;
- a file-loading action;
- a cancellation action that also releases the pending URL;
- drag state and input/drop handlers;
- a structured upload error code.

Loading a new valid file first releases any prior pending URL, then creates one
new URL with `URL.createObjectURL(file)`. The hook owns that URL until
confirmation, cancellation, replacement, or unmount.

## Crop Contract

Replace the existing crop helper with a function that returns `Promise<Blob>`.
The helper receives the source URL and source-space crop rectangle.

The output dimensions are calculated with:

```text
scale = min(1, 1440 / cropWidth, 2700 / cropHeight)
outputWidth = max(1, floor(cropWidth * scale))
outputHeight = max(1, floor(cropHeight * scale))
```

The function creates one canvas at the calculated output size and calls
`drawImage` with the crop rectangle as the source and the complete output
canvas as the destination. It does not allocate a full-source canvas and does
not upscale small selections.

The canvas is encoded as `image/png`. A missing 2D context or failed `toBlob`
callback rejects with a typed error rather than resolving `null`.

Rotation and flip parameters will be removed from this helper because the
current UI exposes neither feature.

## URL Ownership

Object URL ownership is explicit:

- `useImageUpload` owns the pending original URL.
- A managed photo hook at the application-state boundary owns the confirmed
  cropped URL.
- Components may display these URLs but must not revoke them.

On confirmation:

1. the crop helper creates a PNG Blob;
2. the managed photo hook creates the final object URL;
3. application state stores that URL in `croppedImageSrc`;
4. `imageSrc` is set to `null`;
5. after React stops referencing the previous cropped URL, that previous URL is
   revoked;
6. the pending-source cancellation action closes the modal and revokes the
   original URL.

The managed photo hook tracks only URLs it created. It must never revoke an
external URL or an arbitrary Blob URL supplied from outside its ownership
boundary. Its current owned URL is revoked on unmount.

## Crop Modal Behavior

The crop modal adds `processing` and `error` state:

- confirmation is ignored until a crop rectangle exists;
- confirmation sets `processing`, clears the prior error, and disables both
  confirmation and repeated crop work;
- success transfers the Blob to the parent and closes the modal;
- failure keeps the modal and source URL open, clears `processing`, and shows a
  retryable inline status message;
- cancellation and Escape remain available while processing, invalidate that
  request, and prevent a late Blob result from updating application state.

The existing focus trap, Escape behavior, scroll restoration, zoom interaction,
and translations remain intact. New upload and crop errors use localized
messages and an accessible live region.

## Data Flow

1. A file input or drop event calls `loadFile`.
2. The hook validates MIME type and byte size.
3. The hook creates one pending object URL.
4. `CropModal` displays that URL.
5. Confirmation creates one bounded PNG Blob with one canvas.
6. The application-level owner creates and stores the final object URL.
7. React renders the new photo and blurred background from that URL.
8. The pending original and any previous owned result URL are revoked at their
   ownership boundaries.
9. PNG export consumes the final Blob URL through the existing export pipeline.

## Error Handling

- Invalid type: do not create a URL; show an unsupported-format message.
- File over 25 MiB: do not create a URL; show a file-size message.
- Browser image decode or canvas context failure: keep the modal open and show
  a retry message.
- PNG Blob encoding failure: keep the modal open and show a retry message.
- A second confirmation while processing: ignore it.
- Cancellation or unmount: invalidate any active crop request and revoke the
  pending source; a late result is discarded.
- Photo replacement or application unmount: revoke only the final URL owned by
  the managed photo hook.

Errors never replace the last successfully confirmed photo.

## Testing

### Pure and utility tests

- output dimensions preserve aspect ratio;
- large crops are capped at 1440×2700;
- small crops are not upscaled;
- invalid or zero dimensions are rejected;
- one output canvas is created;
- `drawImage` receives the source crop and scaled destination;
- PNG encoding failure rejects.

### Hook tests

- accepted files create exactly one object URL;
- invalid MIME types and files over 25 MiB create none;
- replacement revokes the previous pending URL;
- cancellation and unmount revoke the pending URL;
- confirmed cropped URLs replace and revoke prior owned results;
- external URLs are never revoked;
- unmount revokes the current owned result.

### Component and integration tests

- confirmation cannot start without a crop rectangle;
- duplicate confirmation is blocked while processing;
- crop failure leaves the modal open with an accessible error;
- success stores only `croppedImageSrc` and clears `imageSrc`;
- existing focus, Escape, and scroll behavior remains;
- Blob URL photos render in preview and complete PNG export.

## Verification

Use representative small and large landscape/portrait fixtures and record:

- source file size and source dimensions;
- crop output dimensions and Blob size;
- number and maximum size of canvases allocated by the crop helper;
- successful preview and PNG export;
- browser console errors.

The final implementation must pass the focused tests, complete Vitest suite,
ESLint, and production build.

## Acceptance Criteria

1. Accepted uploads never use `FileReader.readAsDataURL`.
2. Unsupported types and files above 25 MiB are rejected before URL creation.
3. Crop processing allocates one canvas no larger than 1440×2700.
4. Smaller crop selections are not upscaled.
5. Confirmed photos are stored as owned Blob URLs and `imageSrc` is `null`.
6. Pending and confirmed object URLs are revoked exactly once at the correct
   lifecycle boundary.
7. Crop failure is recoverable without losing the previous confirmed photo.
8. Repeated confirmation cannot start duplicate crop work.
9. Existing preview, localization, accessibility, presets, and PNG export
   behavior remains intact.
10. Full tests, lint, and production build pass.
11. Unrelated user files remain untouched.
