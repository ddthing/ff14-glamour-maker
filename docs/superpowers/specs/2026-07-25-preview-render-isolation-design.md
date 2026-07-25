# Preview Render Isolation Design

## Context

`PreviewCanvas` renders two visually independent regions:

- `PhotoPanel`, which depends on the selected photo and its own hover state;
- `InfoPanel`, which depends on title, creator, equipment, and the photo used as
  its background.

Today `PreviewCanvas` owns `hoverPhoto` and passes the complete `AppState` to
`InfoPanel`. Consequently:

- entering or leaving the photo panel re-renders the full information panel and
  its equipment rows;
- changing equipment or text re-renders the unchanged photo panel;
- inline event callbacks prevent a simple memo boundary from remaining stable.

The tree is not large enough to justify a state-library migration, but its
ownership boundaries do not match the UI update boundaries.

## Goals

- A photo hover change renders only `PhotoPanel`.
- An equipment, title, or creator change renders `InfoPanel` without rendering
  an unchanged `PhotoPanel`.
- A photo change renders both panels because the photo and blurred background
  both change.
- Preserve upload, drag-and-drop, keyboard activation, crop, translation, and
  export behavior.
- Lock the render boundary with deterministic component tests.

## Non-goals

- Migrating application state to Context, Zustand, or another state library.
- Optimizing `ControlPanel` in this stage.
- Changing visual styles, transitions, or the blur implementation.
- Memoizing every component in the application.
- Using jsdom timing as a performance benchmark.

## Approaches considered

### 1. Local ownership plus targeted memo boundaries — recommended

Move hover state into `PhotoPanel`. Wrap `PhotoPanel` and `InfoPanel` in
`memo`, pass `InfoPanel` only the state slices it reads, and give `PhotoPanel` a
stable file-picker callback.

This aligns state ownership with the region that changes and produces a small,
testable boundary without new infrastructure.

### 2. Selector-based global state

Move state to Context selectors or Zustand so each component subscribes to its
own slice. This could help a much larger tree but adds a new state model,
migration risk, and dependency for two local boundaries.

### 3. Broad memoization

Wrap the current tree in `memo` without changing props. Because `AppState` and
inline callbacks change identity, comparisons would either fail to skip renders
or require custom equality functions that duplicate domain knowledge.

## Component boundaries

### `PhotoPanel`

`PhotoPanel` will own the transient `hoverPhoto` boolean. Its public props become:

- `croppedImageSrc`;
- `isDragging`;
- `onClick`.

The component retains its current mouse-enter and mouse-leave behavior
internally. It is exported through `memo`.

### `InfoPanel`

`InfoPanel` will receive only:

- `title`;
- `creator`;
- `items`;
- `bgSrc`.

It no longer accepts the complete `AppState`. It is exported through `memo`.
React-i18next context updates continue to re-render it independently when the
language changes.

### `PreviewCanvas`

`PreviewCanvas` remains responsible for upload, drag, crop-modal, and responsive
canvas scale state. It creates one stable `openFilePicker` callback with
`useCallback` and passes it to `PhotoPanel`.

It may continue to receive `AppState` from `App`; the targeted child props are
the important boundary. A broader root-state redesign remains out of scope.

## Render flow

- Photo hover:
  - `PhotoPanel` updates local state;
  - `PreviewCanvas` and `InfoPanel` do not render.
- Equipment/title/creator update:
  - `PreviewCanvas` renders because its parent state changed;
  - `InfoPanel` renders with changed slice props;
  - `PhotoPanel` skips because photo, drag state, and callback are unchanged.
- Photo update:
  - `PhotoPanel` renders the new foreground;
  - `InfoPanel` renders the new background.
- Drag state update:
  - `PreviewCanvas` and `PhotoPanel` render;
  - `InfoPanel` skips.

## Testing

Add a focused jsdom component test that mocks `PhotoPanel` and `InfoPanel` with
render counters while retaining the real `PreviewCanvas` ownership behavior.
Mock `ResizeObserver` and animation-frame scheduling deterministically.

The test must first demonstrate the current failures:

- photo hover causes `InfoPanel` to render again;
- an equipment-only prop update causes `PhotoPanel` to render again.

After refactoring, assert:

- hover affects only `PhotoPanel`;
- equipment changes affect only `InfoPanel`;
- photo changes affect both panels.

Run the complete test suite, ESLint, and the manifest-gated production build.

## Success criteria

- Transient hover state is no longer owned by `PreviewCanvas`.
- `InfoPanel` does not accept complete `AppState`.
- Render-isolation tests cover hover, equipment, and photo changes.
- No visual or interaction behavior changes.
- Full tests, lint, and production build pass.
