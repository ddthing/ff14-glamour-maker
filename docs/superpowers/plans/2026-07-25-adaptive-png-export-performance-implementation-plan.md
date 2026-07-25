# Adaptive PNG Export Performance Implementation Plan

**Design:** `docs/superpowers/specs/2026-07-25-adaptive-png-export-performance-design.md`

## 1. Lock the quality policy with tests

- Add failing tests for desktop, coarse-pointer, narrow-viewport, low-memory,
  and unavailable-memory environments.
- Implement a pure, dependency-free pixel-ratio selector returning only 2 or 3.
- Read the browser environment at export time while allowing deterministic
  dependency injection in tests.

## 2. Lock image preparation behavior with tests

- Add failing tests proving duplicate remote sources are fetched and encoded
  once.
- Prove `data:` and `blob:` sources bypass preparation.
- Prove an individual preparation failure keeps the original source and does
  not fail the export.
- Preserve exact original `src` attributes after success and renderer failure.

## 3. Add bounded preparation

- Add a failing test with more than four blocked remote sources.
- Implement a small internal concurrency runner capped at four tasks.
- Apply prepared data URLs only after all remote preparation settles.
- Decode successfully replaced images before rendering.

## 4. Integrate adaptive rendering

- Pass the selected pixel ratio to `html-to-image`.
- Preserve `preparing` then `rendering` stage order.
- Keep `useExport`, sharing, download fallback, and retry behavior unchanged.

## 5. Verify and commit

- Run the focused export test suite.
- Run the complete Vitest suite, ESLint, and the production build.
- Inspect the final diff and ensure unrelated user files remain untouched.
- Commit the implementation separately from the approved design.
