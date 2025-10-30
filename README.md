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
