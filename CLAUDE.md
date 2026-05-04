# FF14 Glamour Maker - Senior Architect Guidelines

## 🏗️ Project Architecture & Design System
The project follows a **Feature-Based Modular Architecture** and adheres to the **Cursor-inspired Design System** (see `DESIGN.md`).

### Design Reference: Cursor (Warm Minimalism)
- **Palette**: Cream (`#f2f1ed`), Warm Black (`#26251e`), Accent Orange (`#f54e00`).
- **Typography**: Compressed gothic headings, editorial serif body, mono code.
- **Atmosphere**: Premium print-like quality with organic borders (oklab color space).

### Directory Structure
- `src/features/`: Core business domains (e.g., `glamour`, `canvas`).
- `src/components/ui/`: Atomic UI components (Shadcn-like primitives).
- `src/constants/`: Static data (Dyes, Equipment Slots, etc.).
- `src/hooks/`: Reusable cross-feature logic.
- `src/utils/`: Pure helper functions.
- `functions/`: Cloudflare Pages Functions (Serverless).

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 (Utility-first with custom oklab color tokens)
- **State**: React State (Plan to migrate to Zustand if complexity grows)
- **I18n**: i18next
- **Rendering**: html-to-image (DOM to Canvas)

## 🤖 Agent Skills & Tooling (Armory)
Use the following skills for specific tasks to maintain high design taste:
- **Layout & Design System**: `stitch-skill` + `gpt-taste` (Referencing `DESIGN.md`).
- **Frontend Construction**: `impeccable` + `design-taste-frontend`.
- **Aesthetics & Motion**: `soft-skill` + `animate`.
- **Typography & Polish**: `typeset` + `polish`.
- **Advanced UI**: `overdrive` (For canvas/image operations).

## 📏 Coding Standards
### Naming Conventions
- **Components**: `PascalCase` (e.g., `GlamourSelector.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useGlamourState.ts`)
- **Utils/Constants**: `camelCase` / `SCREAMING_SNAKE_CASE`
- **Directories**: `kebab-case`

### TypeScript
- Use `interface` for component props and state objects.
- Use `type` for unions, intersections, and primitives.
- Avoid `any` at all costs. Use `unknown` if type is truly dynamic.

### Components
- Favor composition over complex prop drilling.
- Use `tailwind-merge` (`twMerge`) for merging tailwind classes.
- Logic should be extracted into custom hooks within the feature directory.

## 🚀 Development Workflow
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Deployment**: Automatic via Cloudflare Pages (GitHub Integration)
- **Image Sync**: `npm run sync` (Local script for data maintenance)

## 🎨 Design Principles (Apple-inspired)
- **Minimalism**: Clean layout, generous whitespace.
- **Product First**: The character preview is the hero element.
- **No CLS**: Ensure ad containers and image placeholders have fixed aspect ratios.
- **Aesthetics**: Use curated color palettes (not default red/blue). Use HSL for dynamic themes.
