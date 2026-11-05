# Small Web

Requirements: Node 22, npm 10, MongoDB (`docker compose up -d`, or set `MONGODB_URI`)

```
docker compose up -d
npm install
npm run dev:api       # http://localhost:4000/api/health
npm run format
npm run lint
npm run typecheck
```
