# Bounded Image Upload and Crop Memory Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-bounded-image-crop-memory-design.md`

## 1. Lock file validation and pending URL ownership

- Add pure tests for the raster MIME allowlist and 25 MiB limit.
- Add hook tests for object URL creation, replacement, cancellation, invalid
  input, and unmount cleanup.
- Replace source `FileReader` conversion with a validated object URL.
- Expose structured upload errors and one cancellation action.

## 2. Lock bounded one-pass cropping

- Add tests for output-size calculation, no upscaling, invalid dimensions,
  one-canvas allocation, draw arguments, and Blob encoding failure.
- Replace the full-source intermediate canvas with direct source-to-output
  drawing.
- Return a PNG Blob capped at 1440×2700.

## 3. Add confirmed photo URL ownership

- Add hook tests proving owned result replacement and unmount cleanup.
- Prove external URLs are never revoked.
- Store only the confirmed cropped URL and clear `imageSrc`.
- Update the application boundary so components receive a Blob callback.

## 4. Harden the crop modal

- Add tests for missing crop rectangles, duplicate confirmation, cancellation
  during processing, late-result suppression, and recoverable errors.
- Add processing and localized error state without changing layout or focus
  behavior.
- Wire upload validation errors into an accessible live region.

## 5. Verify and commit

- Run focused upload, crop, state-action, canvas, and export tests.
- Run the complete Vitest suite, ESLint, and production build.
- Inspect object URL cleanup paths and the final diff.
- Preserve unrelated user files and commit the implementation separately.
