# Environment Configuration Setup

This project supports multiple environments (development and production) with easy switching between them.

## Quick Start

### For Local Development (localhost)
```bash
npm run env:development
npm run dev:development
```

### For Productionomo
```bash
npm run env:production
npm run dev:production
```

## Environment Files

- `env.development` - Local development configuration (localhost backend)
- `env.production` - Production configuration (live API)
- `.env` - Active environment file (auto-generated)

## Configuration Variables

| Variable | Description | Development Value | Production Value |
|----------|-------------|-------------------|------------------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://backend-motoka.test/api` | `https://api.motoka.ng/api` |
| `VITE_ENV` | Environment identifier | `development` | `production` |

## Available Scripts

### Development
- `npm run dev` - Start development server with default environment
- `npm run dev:development` - Start development server with development environment
- `npm run dev:production` - Start development server with production environment

### Environment Switching
- `npm run env:development` - Switch to development environment
- `npm run env:production` - Switch to production environment

### Building
- `npm run build` - Build for production
- `npm run build:development` - Build with development environment
- `npm run build:production` - Build with production environment

## How It Works

1. **Environment Detection**: The app automatically detects the current environment using Vite's built-in environment variable system.

2. **Dynamic Configuration**: The `config.js` file provides helper functions to get the current API base URL and environment status.

3. **API Client**: The `apiClient.js` automatically uses the correct base URL based on the current environment.

4. **Easy Switching**: Use the provided scripts to quickly switch between environments without manually editing files.

## Backend Setup

Make sure your local backend is accessible at `http://backend-motoka.test` and has the `/api` endpoint available.

## Troubleshooting

- If you get CORS errors, ensure your backend allows requests from `http://localhost:3000`
- If the environment doesn't switch, try restarting the development server
- Check that the `.env` file exists and contains the correct values
