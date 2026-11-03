# 90-Day AI Platform Plan: progress tracker

A small React site that holds the whole 90-day AI Platform Engineer plan (kickoff, 12 weeks of daily steps, gates, every link) and tracks your progress through it.

## Features
- Dashboard with overall progress, the current week and the next unchecked tasks
- Kickoff and Weeks 1 to 12, each a checklist with links, a "done when" criterion and a log for your notes
- Gates page for the four checkpoints (Weeks 2, 5, 8 and 11)
- All links in one filterable table, plus site-wide search
- Progress and notes are saved in your browser (`localStorage`); Export and Import in the sidebar back them up or move them between devices
- Works on phones, supports dark mode, prints cleanly

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # data and helper tests
npm run build    # static site in dist/
```

## Edit the plan
The content lives in `src/data/plan.json`. It was generated from `scripts/plan-source.txt` by `scripts/build-plan.py` (`python3 scripts/build-plan.py`). Edit either one; the JSON is what the app reads.

## Publish on GitHub Pages
`.github/workflows/deploy.yml` tests, builds and deploys on every push to `main`. One-time setup: in the repository go to Settings, then Pages, and set Source to **GitHub Actions**.

## Privacy
The site is public, but your progress never leaves your browser. Keep personal or employer details out of your notes if you plan to export and commit them.
