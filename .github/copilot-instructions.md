# Anime Tracker Guidelines

## Code Style
- React components: PascalCase, functional with hooks
- Backend: CommonJS, snake_case variables, parameterized SQL queries
- ESLint: ES2020 + JSX, React hooks linting enabled
- Naming: kebab-case CSS classes, snake_case DB fields

## Architecture
- Frontend: React 19 + Vite SPA with 9 routes, state passed via router navigation
- Backend: Single Express file with PostgreSQL, 27 endpoints, background reminder checks
- External APIs: Jikan for anime data, OpenAI for chatbot
- Database: JSON-serialized anime lists (denormalized)

## Build and Test
- Frontend: `npm run dev` (Vite dev server), `npm run build` (production)
- Backend: `cd server && node index.js` (requires PostgreSQL setup)
- Environment: Set `PG_DATABASE`, `PG_PASSWORD`, `OPENAI_API_KEY` for backend
- No test suite yet

## Conventions
- Auth state via router navigation (loses on refresh)
- Admin access via `is_admin=true` query param (not secure)
- Hardcoded backend URL `http://localhost:3001`
- Watch time assumes 24-min episodes

See [PROJECT_SNAPSHOT.md](PROJECT_SNAPSHOT.md) for detailed feature overview and known limitations.</content>
<parameter name="filePath">c:\Users\mukku\My-Web Projects\anime-tracker\.github\copilot-instructions.md