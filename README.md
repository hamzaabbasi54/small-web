# Small Web

Requirements: Node 22, npm 10, MongoDB (`docker compose up -d`, or set `MONGODB_URI` in `apps/api/.env`)

```
docker compose up -d
npm install
npm run build:shared
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run seed
npm run dev:api       # http://localhost:4000/api
npm run dev:web       # http://localhost:3000
```

Checks:

```
npm test
npm run lint
npm run typecheck
```
