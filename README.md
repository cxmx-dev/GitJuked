# GitJuked

## How to run

Drop audio anywhere under `audio/` (subfolders OK), then start GitJuked:

```powershell
git clone https://github.com/cxmx-dev/GitJuked.git
cd GitJuked
.\scripts\start.ps1
```

**`start.ps1` does this every time:**

1. Scans `audio/` recursively and rewrites `tracks.json`
2. Commits and pushes to GitHub if `audio/` or `tracks.json` changed
3. Opens local preview at http://localhost:3000

**Live site:** https://cxmx-dev.github.io/GitJuked/

---

### Manual steps (if you only need one piece)

| Task | Command |
|------|---------|
| Sync `tracks.json` only | `.\scripts\gen-tracks.ps1` |
| Local preview only | `.\scripts\preview.ps1` |
| First-time GitHub auth | `.\scripts\auth-github.ps1` then `.\scripts\push-pages.ps1` |

First-deploy walkthrough: [docs/deploy-auth-annotation.md](docs/deploy-auth-annotation.md) · [visual callouts](docs/deploy-auth-visual.html)

---

Zero-dependency cyber-green HUD audio player — hosted on GitHub Pages, with local **Browse Folder** power-user mode.

## Features

- Full-screen frequency visualizer (`#00ffaa` bars on black)
- Auto-hide HUD (mouse, click, keyboard activity)
- Hosted playlist from `tracks.json` + `audio/`
- Local override via File System Access API (**Browse Folder**)

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ← | Previous track |
| → | Next track |
| S | Shuffle playlist |

## Add a track

1. Drop `.wav` / `.mp3` / `.ogg` into `audio/` (any subfolder)
2. Run `.\scripts\start.ps1` — syncs, pushes, and previews automatically

Or push manually:

```powershell
.\scripts\gen-tracks.ps1
git add audio/ tracks.json
git commit -m "track: your-filename"
git push
```

## Sharing the player vs. hiding the repo

**Share this link** (listeners only need this): https://cxmx-dev.github.io/GitJuked/

| Goal | What to do |
|------|------------|
| Anyone can **listen** via the link | Already works — share the Pages URL only |
| Hide **repo source** on GitHub | Needs **GitHub Pro** (~$4/mo) → make repo **private**, keep Pages **public** |
| Stay on **Free** | Repo must stay **public** for Pages to work; share only the player link, not the repo URL |

**Do not** set the repo to private on a Free account — `https://cxmx-dev.github.io/GitJuked/` will break.

**This project stays on Free** — repo is public; share only the player link above, not the GitHub repo URL.

Full breakdown: [docs/repo-privacy.md](docs/repo-privacy.md)

## Stack

Vanilla HTML / CSS / JS — no build step, no framework. See `PLAN.md` for architecture and iteration tickets.

## Version History

2026-07-06

- Documented repo privacy vs. public GitHub Pages (Free vs. Pro).
- Sanitized docs: no local drive paths, timezone, or session-specific auth codes.
- Staying on Free — share player link only.