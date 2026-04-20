# Wallabies Matchday

Match day tracker for **Essendon Royals SC U09 MiniRoos – Wallabies Female U9 RED**.

Live app: **https://dagost2.github.io/matchday/**

Add to your iPhone home screen via Safari → Share → Add to Home Screen.

---

## Features

- **Season fixture** — full 2026 season (pre-season + Rounds 1–17) pre-loaded
- **Match timer** — counts up through two 20-minute halves, turns amber in injury time, pauses/resumes, survives page refresh
- **Goal recording** — tap `+` for Wallabies to pick a scorer from the squad, tap `+` for the opponent to record without a name
- **Half-time screen** — shows 1st half score and scorers before starting 2nd half
- **Season results** — all match scores and goal scorers saved, viewable from the fixture list
- **Squad management** — add or remove players from the Squad tab
- **Offline** — works without internet once loaded (PWA)

---

## Squad

Mietta · Giulia · Harriet · Sarina · Ella · Mila · Ariana · Ava · Sofia · Zara · Meika

---

## Development

Requires [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
```

Deploying is automatic — push to `main` and GitHub Actions builds and deploys to GitHub Pages.
