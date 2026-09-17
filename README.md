# Chess Improver

Training against positions I've encountered. Revisit games and quiz yourself on the next move

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Positions are stored in `data/positions.json`.

If `APP_PASSWORD` is unset, the app stays open. If it is set, you will be asked for that password.

## Add a position

Paste a Chess.com PGN, step to the ply you want to study, confirm your color, and save questions with answers.

## Deploy to Vercel

```bash
npx vercel
```

Set these environment variables:

- `APP_PASSWORD` — required in production
- `CHESS_USERNAME` — defaults to `hoptheponyfrythechicken`
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token so phone and computer share the same JSON store
