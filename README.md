# CaseVerse

An AI-powered, single-player mystery investigation game. Players create a fictional premise, investigate generated suspects and evidence, use progressive hints, and make one final accusation. Gemini and all answer-key data stay on the server.

## Stack

- React, TypeScript, Vite, Tailwind CSS
- Node.js, Express, TypeScript
- MongoDB with Mongoose
- Google Gemini through the official Google GenAI SDK
- Zod runtime validation

## Local setup

1. Install Node.js 20+ and MongoDB (local MongoDB or Atlas).
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, a random `SESSION_SECRET`, and `GEMINI_API_KEY`. Copy `client/.env.example` to `client/.env.local`. `GEMINI_MODEL` defaults to `gemini-3.8-flash`; change it if your account uses a different supported model.
3. Install dependencies from the repository root: `npm install`.
4. Build shared contracts: `npm run build -w shared`.
5. Start the API and web app: `npm run dev`.
6. Open `http://localhost:5173`. The API health check is `http://localhost:5000/health`.

The app intentionally fails mystery generation if Gemini is not configured. It never presents a fabricated fixture as a successful AI result. Generated cases and artifacts are fictional. Use HTTPS and set an exact `CLIENT_ORIGIN` for production.

## Project layout

```text
client/   React application, pages, and responsive styling
server/   Express API, Mongo models, auth, Gemini generation, investigation routes
shared/   Runtime schemas, data contracts, semantic mystery validation
SPEC.md   Product and technical source of truth
```

## API

The REST API is under `/api/v1`: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/cases`, `/cases/:id`, `/cases/:id/progress`, `/cases/:id/hints`, and `/cases/:id/accusations`. Session cookies are HTTP-only and same-site. Case ownership is derived from the authenticated session. The ordinary case DTO excludes the private solution; the accusation endpoint returns it after the final answer is recorded.

## Current MVP boundaries

Solution reveal without an accusation is disabled. Evidence media are fictional text transcripts or photo descriptions, not connected to messaging accounts, cameras, or real people. Production deployment, provider credentials, and a managed database must be configured outside this repository.
