# Home Screen Maker Name Implementation Plan

1. Strengthen home-screen asset tests to require identical `name` and
   `short_name` values for each language.
2. Add a dedicated `home_screen_name` translation for Korean, English, and
   Japanese.
3. Update localized metadata to use the dedicated home-screen name.
4. Update all localized manifests and the static Korean metadata fallback.
5. Run focused and full verification, then publish through a PR to `main`.
