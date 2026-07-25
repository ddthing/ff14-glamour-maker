# Lazy Feature Chunk Isolation Design

## Context

The crop editor and PNG exporter are activated by different user actions and
are already loaded through separate dynamic imports. The build configuration
overrides that boundary by placing `react-easy-crop` and `html-to-image` in one
manual `vendor-canvas` chunk.

Current production output:

- `vendor-canvas`: 37,369 bytes, 12,152 bytes gzip;
- crop entry: 6,601 bytes, 2,504 bytes gzip, plus `vendor-canvas`;
- export entry: 1,853 bytes, 981 bytes gzip, plus `vendor-canvas`.

Opening either feature therefore downloads both feature libraries. The shared
chunk is not part of the initial entry, so it provides no initial-load cache
benefit.

## Goals

- Keep crop-only code out of the export interaction.
- Keep export-only code out of the crop interaction.
- Preserve the existing initial bundle and all runtime behavior.
- Detect future accidental coupling in the normal production build.
- Prefer bundler-native dynamic boundaries over package-specific configuration.

## Non-goals

- Changing the crop or PNG export implementation.
- Reworking React component boundaries.
- Replacing Vite or upgrading its major version.
- Reorganizing React, i18n, or icon-library chunks.
- Enforcing exact hashed filenames or fragile byte-perfect chunk sizes.

## Approaches considered

### 1. Remove the forced canvas vendor chunk — recommended

Delete only the `vendor-canvas` manual chunk. Each library is imported by one
dynamic feature entry, so Rollup can include it in that feature's natural lazy
chunk. This uses the source import graph as the contract and avoids maintaining
package-name routing.

This also reduces reliance on the object form of `manualChunks`, which is not
supported by the Rolldown path described in Vite's next-major migration guide.

### 2. Create `vendor-crop` and `vendor-export`

This produces explicit filenames but retains unnecessary package-specific
manual configuration. It also creates an extra request per feature and carries
more migration work.

### 3. Keep the shared chunk

This is stable but knowingly transfers unrelated code on both interactions.

## Build configuration

Keep the existing React and i18n chunk decisions unchanged. Remove only:

```ts
'vendor-canvas': ['react-easy-crop', 'html-to-image']
```

Enable Vite's build manifest. The manifest is build metadata under
`dist/.vite/manifest.json`; it is not loaded by the browser.

The existing malformed comment around the UI chunk declaration will be cleaned
up only as needed to make the active configuration unambiguous. No new UI chunk
policy is introduced.

## Isolation contract

Add `scripts/checkLazyChunkIsolation.mjs` and run it after every production
build.

The checker reads the Vite manifest and:

1. resolves the initial entry, crop dynamic entry, and export dynamic entry;
2. walks each entry's transitive static imports;
3. removes dependencies already reachable from the initial entry;
4. fails if the crop-only and export-only dependency sets overlap;
5. fails if either dynamic entry is missing.

Shared dependencies that are already downloaded on initial load are allowed.
This avoids false failures for React, i18n, and UI primitives while detecting a
new lazy-only bridge such as `vendor-canvas`.

The checker reports the conflicting manifest keys so failures are actionable.
It does not assert hashed filenames or exact byte sizes.

## Package scripts

The standard `npm run build` command will:

1. run TypeScript project compilation;
2. run `vite build --manifest`;
3. run the lazy chunk isolation checker.

No separate optional verification command is required; local and CI production
builds use the same gate.

## Testing

- Run the isolation checker against the current manifest and confirm it fails
  on `_vendor-canvas-*.js`.
- Remove the forced shared chunk and rebuild.
- Confirm the standard build succeeds and no `vendor-canvas` file exists.
- Record the new crop and export raw/gzip transfer sizes.
- Run all tests and ESLint.
- Inspect the manifest to confirm the entries remain dynamic and isolated.

## Success criteria

- `npm run build` includes the manifest isolation gate.
- Crop and export have no shared lazy-only dependency.
- No `vendor-canvas` asset is emitted.
- Neither feature becomes part of the initial entry.
- Full tests, lint, TypeScript, and production build pass.
