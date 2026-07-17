# Home Screen Maker Name Design

## Goal

Use the complete localized Maker name as the default label when the web app is
added to a device home screen.

## Localized Names

- Korean: `투영세트 메이커`
- English: `Glamour Set Maker`
- Japanese: `ミラプリセットメーカー`

## Design

- Add a dedicated localized home-screen name instead of changing the visible
  in-app brand.
- Use the same value for each manifest's `name` and `short_name`.
- Use the same localized value for `apple-mobile-web-app-title`.
- Keep the existing icon files, start URL, scope, display mode, and colors.

## Verification

- Assert that every manifest uses the full localized name for both name fields.
- Assert that language changes update the iOS home-screen title.
- Run the full test suite, lint, and production build.
