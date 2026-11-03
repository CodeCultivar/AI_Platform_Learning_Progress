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
- Optional cross-device sync through a private GitHub gist (see below)
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
There is no server: the site is static, so sync uses a **secret GitHub gist** as storage.

1. Click **Sync devices** in the sidebar and follow the link to create a fine-grained GitHub token with no repository access and only the **Gists: Read and write** account permission (GitHub documents this permission for the gist endpoints). If GitHub rejects it, use a classic token with only the `gist` scope.
2. First device: paste the token and leave Gist ID empty. A gist is created and its ID is shown.
3. Other devices: paste the same token plus that Gist ID.

Every check-off and note is timestamped, and each sync merges per item (newest edit wins), so edits from two devices combine instead of overwriting each other. It syncs shortly after each edit, when the tab regains focus, and every minute. The token is stored only in that browser; delete it on GitHub if a device is lost. A secret gist is unlisted, not private to everyone: anyone with its URL can read it.

## Privacy
The site is public. Without Sync, your progress never leaves your browser; with Sync it goes only to your gist. Keep personal or employer details out of your notes if you plan to export and commit them.
