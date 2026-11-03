# 90-Day AI Platform Plan: progress tracker

A small React site that holds the whole 90-day AI Platform Engineer plan (kickoff, 12 weeks of daily steps, gates, every link) and tracks your progress through it.

## Features
- Home page explaining the plan, the research behind it, how sync works and every source
- Adjustable timeframe: set the start date, the pace (from about 10 down to about 1.25 hours a week) and any breaks; every date recalculates and the setting syncs across devices
- Dashboard with overall progress, the current week and the next unchecked tasks
- Kickoff and Weeks 1 to 12, each a checklist with links, a "done when" criterion and a log for your notes
- Gates page for the four checkpoints (Weeks 2, 5, 8 and 11)
- All links in one filterable table, plus site-wide search
- Progress and notes are saved in your browser (`localStorage`); Export and Import in the sidebar back them up
- One-click cross-device sync with Google sign-in (Firebase), or a private GitHub gist (see below)
- Works on phones, supports dark mode, prints cleanly

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # data and helper tests
npm run build    # static site in dist/
```

## Edit the plan
The plan holds no calendar dates; they are computed from your schedule settings in `src/lib.js` (`buildSchedule`). The content lives in `src/data/plan.json`. It was generated from `scripts/plan-source.txt` by `scripts/build-plan.py` (`python3 scripts/build-plan.py`). Edit either one; the JSON is what the app reads.

## Publish on GitHub Pages
`.github/workflows/deploy.yml` tests, builds and deploys on every push to `main`. One-time setup: in the repository go to Settings, then Pages, and set Source to **GitHub Actions**.

## Sync across devices
Two options, both merge per item (newest edit wins), so edits from different devices combine instead of overwriting each other.

**Google sign-in (recommended).** Users click **Sign in with Google** and everything syncs automatically: progress, notes and schedule, live across devices. If a different account signs in on a browser holding someone else's progress, the site asks before mixing them, and each user can delete their cloud copy. For this to work the site owner runs one Firebase project (Firestore plus Google sign-in) behind owner-only security rules: a one-time, 10-minute setup in [docs/GOOGLE_SYNC_SETUP.md](docs/GOOGLE_SYNC_SETUP.md). The site reads `public/firebase-config.json` (copy `public/firebase-config.example.json`); without that file the sign-in button is hidden. The config values are public by design; the rules in `firebase/firestore.rules` protect the data. Note that the project owner can technically read what users store.

**GitHub gist.** No Google setup: paste a GitHub token with only the Gists permission and the site keeps one secret gist. A secret gist is unlisted, not private.

Either way it syncs shortly after each edit, when the tab regains focus and every minute (Google also pushes live updates). The sign-in flow was tested end to end against a stand-in for Firebase, not a real project; the first real sign-in is the real test.

## Privacy
The site is public. Without Sync, your progress never leaves your browser; with Sync it goes only to your own Firestore project or gist. Keep personal or employer details out of your notes if you plan to export and commit them.
