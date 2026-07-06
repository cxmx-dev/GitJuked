# GitJuked

## How to run

Drop audio anywhere under `audio/` (subfolders OK), then start GitJuked:

```powershell
cd E:\Code-Y\GitJuked
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

## Stack

Vanilla HTML / CSS / JS — no build step, no framework. See `PLAN.md` for architecture and iteration tickets.