# Legacy Runtime State Cleanup Implementation Plan

1. Update codec tests to define the compatibility boundary:
   legacy photo/crop fields are ignored, while malformed persisted fields still
   recover safely.
2. Remove `imageSrc`, `crop`, and `zoom` from `AppState`, initial state, demo
   data, state cloning, photo actions, and preview rendering.
3. Simplify `stateCodec` so it constructs only the live runtime state and no
   longer validates obsolete fields.
4. Update affected render and action tests without weakening their behavioral
   assertions.
5. Run targeted tests, all tests, lint, and production build; then commit the
   verified change without staging unrelated workspace files.

