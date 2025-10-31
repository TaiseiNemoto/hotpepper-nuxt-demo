# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HotPepper Gourmet API検索サイト: Nuxt 4によるSSR/CSR検証プロジェクト。飲食店の検索・閲覧機能を提供する3画面構成（TOP/検索結果/詳細）。

## Development Commands

### Package Management

```bash
# Install dependencies (uses Yarn 4)
yarn install

# Note: npm is disabled (npm=0.0.0 in engines)
```

### Development Server

```bash
# Start dev server at http://localhost:3000
yarn dev
```

### Building & Production

```bash
# Build for production
yarn build

# Preview production build
yarn preview

# Generate static site
yarn generate
```

### Type Checking & Linting

```bash
# Type check
yarn type-check

# ESLint
yarn lint
yarn lint:fix

# Stylelint (checks src/**/*.{vue,scss,css})
yarn lint:css
yarn lint:css:fix

# Format all files
yarn format
```

## Architecture

### Tech Stack

- **Framework**: Nuxt 4
- **Language**: TypeScript with strict compiler options (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)
- **Styling**: Tailwind CSS + SCSS
- **Maps**: Google Maps JavaScript API
- **API**: HotPepper Gourmet API (server-side proxy via Nitro)
- **Package Manager**: Yarn 4 (Berry)

### Application Structure

3-screen flow:

1. **TOP**: Search form + "Hot nearby restaurants" carousel
2. **Search Results**: List/map toggle view with pagination
3. **Detail**: Restaurant details + HotPepper link

### Data Flow

- Client → Nitro server endpoints → HotPepper Gourmet API
- Server-only API key (`NUXT_HOTPEPPER_API_KEY`) never exposed to client
- Google Maps API key exposed via `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Environment Setup

Copy `.env.example` to `.env` and set required API keys:

- `NUXT_HOTPEPPER_API_KEY` (server-only, required)
- `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client-exposed, required)
- `NUXT_LOG_LEVEL` (optional, defaults to `info`)
- `NUXT_LOG_ENABLE_ACCESS` (optional, defaults to `true`)

## Code Style & Conventions

### ESLint Rules

- **Import sorting**: `sort-imports` enabled (warns on unsorted member imports)
- **Naming**: No `I` prefix for interfaces/types (enforced via `@typescript-eslint/naming-convention`)
- **Vue components**:
  - PascalCase in templates (registered components only)
  - File names must match component names (case-sensitive)
  - Scoped or module styles enforced
  - `v-html` usage is an error

### Stylelint

- Uses `stylelint-config-standard-scss`
- Vue SFC-specific overrides for `:deep`, `:global`, `:slotted` pseudo-classes
- Integrated with Prettier via `stylelint-prettier`

### Prettier

- No semicolons (`semi: false`)
- Single quotes (`singleQuote: true`)
- Print width: 100 characters

### Git Hooks

- Pre-commit: Husky + lint-staged
  - Auto-fixes ESLint errors on `*.{js,ts,vue}`
  - Formats all files with Prettier

### Commit Messages

- Use conventional commits format with `chore:`, `feat:`, `fix:`, etc.
- Keep messages concise and in Japanese when appropriate
- Examples: `chore: prepare environment config`, `feat: 検索機能を追加`

## Target Environment

- Modern browsers (Chrome/Edge/Firefox/Safari latest versions)
- Desktop-focused (mobile not in scope for this tech validation)
- WCAG 2.2 Level A accessibility target
- SEO optimized (title/description/OGP for each page)
