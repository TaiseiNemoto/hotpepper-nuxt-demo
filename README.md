## Setup

Install dependencies with Yarn (the project uses Yarn 4):

```bash
yarn install
```

### Environment variables

Copy `.env.example` to `.env` and set the secrets before starting the app.

```bash
cp .env.example .env
```

| Key                               | Required | Description                                   |
| --------------------------------- | -------- | --------------------------------------------- |
| `NUXT_HOTPEPPER_API_KEY`          | Yes      | HotPepper Gourmet API key (server only)       |
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes      | Google Maps JavaScript API key (client usage) |
| `NUXT_LOG_LEVEL`                  | No       | Minimum server log level (`info` by default)  |
| `NUXT_LOG_ENABLE_ACCESS`          | No       | `true/false` toggle for access logging        |

Refer to the Nuxt documentation for any additional setup guidance.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

## Testing

Run tests with Vitest:

```bash
# Run tests once
yarn test --run

# Run tests in watch mode
yarn test

# Run tests with UI
yarn test:ui

# Generate coverage report
yarn test:coverage
```

The project uses [@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing) for Nuxt-specific testing utilities. Tests are located in the `tests/` directory.

## Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Application Overview

This is a restaurant search application powered by HotPepper Gourmet API, built with Nuxt 4 (SSR/CSR hybrid).

### Pages

- **TOP (`/`)**: Hero section, search form, and nearby hot restaurants carousel
- **Search Results (`/shops`)**: Restaurant list with map/list toggle view and pagination
- **Detail (`/shops/[id]`)**: Restaurant details with Google Maps integration

### Components

#### Layout Components

- `AppHeader.vue`: Application header with logo and navigation
- `AppFooter.vue`: Application footer with credits and links

#### Search Components

- `SearchForm.vue`: Main search form with keyword, genre, and area selectors
- `SearchKeywordField.vue`: Keyword input field
- `SearchGenreSelector.vue`: Genre selection UI (max 2)
- `SearchAreaSelector.vue`: Hierarchical area selection (large/middle/small)

#### Shop Display Components

- `ShopCard.vue`: Restaurant card component (thumbnail, name, genre, catch copy)
- `ShopHeader.vue`: Restaurant detail header
- `ShopInfoGrid.vue`: Restaurant information grid (address, hours, budget, etc.)
- `ShopMap.vue`: Single restaurant map with marker

#### List/Map Components

- `ResultList.vue`: Restaurant list view with skeleton loading
- `ResultMap.vue`: Multiple restaurants map with markers and info windows
- `PaginationControl.vue`: Pagination control with compact display

#### Other Components

- `HeroSection.vue`: TOP page hero section
- `NearbyHotCarousel.vue`: Nearby hot restaurants carousel with geolocation

#### Icon Components

- `icons/XIcon.vue`: Close/delete icon

## Code Quality

All code follows strict TypeScript, ESLint, Stylelint, and Prettier configurations. Pre-commit hooks ensure code quality with lint-staged and Husky.
