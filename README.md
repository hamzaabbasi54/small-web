# Small Web

A pretend web of one-page sites stored in MongoDB, and a browser to read them.
NestJS API (`apps/api`), Next.js web app (`apps/web`), shared types (`packages/shared`).

## Requirements

- Git
- Node.js 22 (with npm 10): https://nodejs.org
- Docker Desktop, running (for MongoDB): https://www.docker.com/products/docker-desktop

## All commands, in order

```
git clone https://github.com/hamzaabbasi54/small-web.git
cd small-web

docker compose up -d
npm install
npm run build:shared
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run seed

npm run dev:api       # terminal 1 → http://localhost:4000/api
npm run dev:web       # terminal 2 → http://localhost:3000
```

Checks:

```
npm test
npm run lint
npm run typecheck
```

---

## How to run it (brief explanation)

1. **Install the requirements.** Install Git, Node 22 and Docker Desktop, then open a new
   terminal and check them with `git --version`, `node -v` and `docker --version`.
   On Windows, use PowerShell or Git Bash, not `cmd.exe`.
2. **Clone** the repository and `cd` into it. Run all the following commands from this folder.
3. **`docker compose up -d`** starts MongoDB on `localhost:27017` in the background.
   Docker Desktop must be running first. No Docker? Use your own MongoDB or Atlas and put
   its connection string in `MONGODB_URI` in `apps/api/.env` (step 6).
4. **`npm install`** installs the packages for the API, the web app and the shared package at once.
5. **`npm run build:shared`** compiles the shared types that both sides import. It must run before
   the API or web app.
6. **The two `cp` commands** create the environment files. The defaults work as they are:
   the API on port 4000 uses the local MongoDB, and the web app calls `http://localhost:4000/api`.
7. **`npm run seed`** adds 5 people, 12 linked sites and 40 history visits. It's safe to run again.
8. **`npm run dev:api`** in one terminal and **`npm run dev:web`** in a second one. Both keep
   running. Open http://localhost:3000, choose a person in "Browsing as", and type `tidepool.zz`.

**Stop:** Ctrl+C in both terminals, then `docker compose down` to stop MongoDB.

## Troubleshooting

| Problem | Fix |
|---|---|
| Docker "cannot connect" | Start Docker Desktop and wait until it's running. |
| `Cannot find module '@smallweb/shared'` | Run `npm run build:shared`. |
| "Can't reach the server" in the app | The API isn't running, or hasn't finished starting. |
| Port 3000 or 4000 already in use | Stop the other running copy (Ctrl+C), then start again. |
