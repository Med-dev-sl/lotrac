# Security Backend

This folder contains the backend service for authentication, database access, and WebSocket support.

## Setup

1. `cd security`
2. `npm install`
3. Copy `.env.example` to `.env` and update the values.

## Run

- Development: `npm run dev`
- Production: `npm start`

## Notes

- The backend listens on `PORT` from `.env` or defaults to `5000`.
- CORS is configured for `ALLOWED_ORIGIN`, defaulting to `http://localhost:3000`.
- The frontend lives in the project root and should be run separately from the backend.
