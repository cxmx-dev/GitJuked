# GitJuked

Zero-dependency cyber-green HUD audio player — hosted on GitHub Pages, with local **Browse Folder** power-user mode.

**Live:** https://cxmx-dev.github.io/GitJuked/

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

## Add a track in under 60 seconds

1. Drop your `.wav` / `.mp3` / `.ogg` file into `audio/` (GitHub web UI or local copy)
2. Regenerate the manifest:
   ```powershell
   .\scripts\gen-tracks.ps1
   ```
3. Commit and push:
   ```powershell
   git add audio/ tracks.json
   git commit -m "track: your-filename"
   git push
   ```

Live site updates within ~1–2 minutes. No HTML edits required.

## Local preview

```powershell
npx serve .
```

Open http://localhost:3000 — hosted mode loads automatically. **Browse Folder** still works for local libraries.

## Stack

Vanilla HTML / CSS / JS — no build step, no framework. See `PLAN.md` for architecture and iteration tickets.