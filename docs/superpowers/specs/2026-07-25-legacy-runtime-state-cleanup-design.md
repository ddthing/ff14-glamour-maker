# Legacy Runtime State Cleanup Design

## Context

`AppState` still carries `imageSrc`, `crop`, and `zoom`, but the upload flow now
keeps the pending source and crop controls inside `useImageUpload` and
`CropModal`. Only `croppedImageSrc` is part of the live application state.

The preset storage shape already persists only `title`, `creator`, and `items`.
`decodeStateValue` nevertheless validates the obsolete crop fields and
reconstructs them on every decode, coupling persisted data to dead runtime
state.

## Decision

- Remove `imageSrc`, `crop`, and `zoom` from `AppState` and `INITIAL_STATE`.
- Keep `croppedImageSrc` as runtime-only photo state.
- Keep preset schema version 1 because its persisted fields do not change.
- Let the decoder ignore legacy `imageSrc`, `crop`, and `zoom` properties.
  Valid legacy presets therefore remain valid rather than becoming recovered.
- Preserve validation and recovery behavior for all persisted fields.
- Remove obsolete cloning and fallback branches from app initialization,
  actions, preview rendering, demo data, and tests.

## Compatibility

Previously stored presets contain only the stable preset fields and decode
unchanged. Hand-authored or historical objects that also contain the removed
photo/crop properties continue to decode; those properties are deliberately
discarded because photos are not persisted.

## Verification

- Add a regression test proving legacy photo/crop properties are accepted and
  omitted from decoded runtime state.
- Keep malformed persisted-field recovery coverage.
- Run targeted tests, the complete test suite, lint, and the production build.

