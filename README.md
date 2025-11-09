# HackUTD25 Backend

A Node.js backend project built with TypeScript, Express.js, and ES Modules with environment variable support.

## Features

- ✅ TypeScript support with strict configuration
- ✅ Express.js web framework
- ✅ ES Modules (ESM) support
- ✅ Environment variables with dotenv
- ✅ Centralized configuration management
- ✅ Hot reload with nodemon in development
- ✅ Built-in health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file and configure your variables:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your actual configuration:
```env
PORT=3000
NODE_ENV=development
MONGO_CONNECTION="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
API_SECRET_KEY="your_api_secret"
```

4. Run in development mode:
```bash
npm run dev
```

5. Build the project:
```bash
npm run build
```

6. Run the built project:
```bash
npm start
```

## Environment Variables

The application uses the following environment variables:

### Required in Production
- `MONGO_CONNECTION` - MongoDB connection string

### Optional (with defaults)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: development)
- `JWT_SECRET` - JWT signing secret
- `API_SECRET_KEY` - API authentication secret
- `EXTERNAL_API_URL` - External API endpoint
- `EXTERNAL_API_KEY` - External API key

## API Endpoints

- `GET /` - Returns a welcome message
- `GET /health` - Health check endpoint with environment info
- `GET /api/users` - Get users list
- `POST /api/users` - Create a new user

## Configuration

The application uses a centralized configuration system located in `src/config/index.ts`. This file:
- Loads environment variables using dotenv
- Provides type-safe configuration objects
- Validates required variables in production
- Shows warnings for missing optional variables in development

## Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Run the compiled JavaScript
- `npm run clean` - Remove the dist directory

## Project Structure

```
src/
  └── index.ts      # Main Express application entry point
dist/               # Compiled JavaScript output
node_modules/       # Dependencies
tsconfig.json       # TypeScript configuration (ES Modules)
nodemon.json        # Nodemon configuration for development
package.json        # Project configuration with ES modules support
```