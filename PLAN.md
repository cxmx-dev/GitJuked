---
title: GitJuked — GitHub Pages Media Player
project: GitJuked
github_user: cxmx-dev
github_url: https://github.com/cxmx-dev
pages_url: https://cxmx-dev.github.io/GitJuked/
local_root: E:\Code-Y\GitJuked
source: ANON-AUDIO-PLAYER v.01 (single-file HTML + File System Access API)
seed_track: audio/01_-_gitjuke_-_cxmx.wav
stack: vanilla HTML/CSS/JS — zero build required for Day-0
created: 2026-07-06
status: ready-to-implement
---

# GitJuked — Implementation Plan

## Vision

Turn **ANON-AUDIO-PLAYER v.01** into **GitJuked**: a cyber-green HUD media player anyone can open at `https://cxmx-dev.github.io/GitJuked/` with zero setup, while you retain power-user **Browse Folder** mode locally via the File System Access API.

**Dual-mode architecture:**

| Mode | Trigger | Playlist source | Audio source |
|------|---------|-----------------|--------------|
| **Hosted** (default) | `location.protocol === 'https:'` and no local override | `fetch('tracks.json')` | `audio/<filename>` static URLs |
| **Local** (power-user) | User clicks **Browse Folder** or `file://` / localhost | `showDirectoryPicker()` | `URL.createObjectURL(file)` |

Visitors get instant playback of committed tracks. You add/replace `.wav` / `.mp3` / `.ogg` files via GitHub web UI or `git push` — no redeploy step beyond the commit landing on `main`.

**Success metric:** After following this plan, `https://cxmx-dev.github.io/GitJuked/` looks and feels like a finished portfolio demo — black canvas, `#00ffaa` HUD, auto-hide controls, keyboard shortcuts, mobile-friendly ranges, and a live visualizer hooked to the existing `AnalyserNode`.

---

## Repo Setup Commands

Run from `E:\Code-Y\GitJuked` after files are created (Day-0 checklist below).

```powershell
cd E:\Code-Y\GitJuked

# One-time: init + first commit
git init
git add .
git commit -m "feat: GitJuked v1 — hosted + local dual-mode player"

# Create public repo and push (requires gh CLI + auth)
gh repo create cxmx-dev/GitJuked --public --source=. --remote=origin --push

# Enable GitHub Pages from main branch / root (no Jekyll)
gh api repos/cxmx-dev/GitJuked/pages -X POST -f build_type=legacy -f source[branch]=main -f source[path]=/

# Verify Pages is live (may take 1–3 min)
gh api repos/cxmx-dev/GitJuked/pages --jq '.html_url'
```

**Settings auto-handled by the above:**

- Public repo → Pages eligible
- Source: `main` branch, `/` (root) folder
- `.nojekyll` in repo root → GitHub skips Jekyll; raw static files served as-is
- No `gh-pages` orphan branch needed

**If `gh` is unavailable**, create repo at https://github.com/new → name `GitJuked` → public → then:

```powershell
git remote add origin https://github.com/cxmx-dev/GitJuked.git
git branch -M main
git push -u origin main
```

Enable Pages manually: **Settings → Pages → Build from branch → `main` / `(root)` → Save**.

---

## Folder Tree

```
GitJuked/
├── .nojekyll                 # Required: serve audio/ and JSON without Jekyll
├── .gitignore                # OS junk, optional .DS_Store
├── index.html                # Migrated v.01 + dual loader + visualizer canvas
├── tracks.json               # Hosted playlist manifest (generated or hand-edited)
├── audio/
│   └── 01_-_gitjuke_-_cxmx.wav   # Seed track (already present locally)
├── scripts/
│   └── gen-tracks.ps1        # One-liner: scan audio/ → rewrite tracks.json
├── README.md                 # Live link, add-track workflow, keyboard cheatsheet
└── PLAN.md                   # This file
```

**Optional later (not Day-0):**

```
├── favicon.svg               # Minimal juke glyph in #00ffaa
└── CNAME                     # Only if custom domain added
```

---

## Code Diffs

Base: **v.01** from `anonplayer.html` (lines 230–426 — cleaner style block with `input[type="range"]#volume { width:90px }` and `input[type="range"]#timeline { flex:1 }`).

### 1. `<head>` — title, meta, visualizer layer

```diff
- <title>ANON-AUDIO-PLAYER 2</title>
+ <title>GitJuked</title>
+ <meta name="description" content="GitJuked — minimal cyber-green audio player by cxmx-dev">
```

Add before `#hud` in `<body>`:

```html
<canvas id="viz" aria-hidden="true"></canvas>
```

Add CSS:

```css
#viz {
  position: fixed; inset: 0; width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}
#hud { z-index: 100; /* existing */ }
@media (max-width: 680px) {
  #hud { min-width: unset; left: 8px; right: 8px; bottom: 8px; }
  #trackInfo { min-width: 120px; }
}
```

### 2. Track model — unified shape

```javascript
// Hosted:  { name: "GitJuke", src: "audio/01_-_gitjuke_-_cxmx.wav" }
// Local:   { name: "Track 1", handle: FileSystemFileHandle }
```

### 3. Dual loader — replace folder-only bootstrap

Add after constants:

```javascript
const IS_HOSTED = location.protocol === 'https:' || location.hostname === 'localhost';
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

async function loadStaticPlaylist() {
  const res = await fetch('tracks.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('tracks.json missing');
  const data = await res.json();
  return (data.tracks || data).map(t => ({
    name: t.title || t.name,
    src: t.file || t.src
  }));
}

function populatePlaylist(tracks) {
  playlist = tracks;
  playlistSelect.innerHTML = '';
  tracks.forEach((t, i) => {
    playlistSelect.appendChild(new Option(t.name, i));
  });
  if (tracks.length) {
    currentIndex = 0;
    loadTrack(0);
    showHUD();
  }
}

async function initHosted() {
  try {
    const tracks = await loadStaticPlaylist();
    populatePlaylist(tracks);
    trackInfo.textContent = tracks.length ? `GitJuked · ${tracks.length} track(s)` : 'No tracks in manifest';
  } catch (e) {
    trackInfo.textContent = 'Hosted mode — add tracks.json + audio/';
    console.warn(e);
  }
}
```

Call on load:

```javascript
if (IS_HOSTED) initHosted();
```

Keep `loadFolder()` unchanged for local override; after folder pick, it replaces hosted playlist in memory.

### 4. `loadTrack()` — add static `src` branch

```diff
  function loadTrack(index) {
    if (!playlist[index]) return;
    const track = playlist[index];
    ...
    revokeCurrentURL();

+   if (track.src) {
+     audio.src = track.src;
+     audio.load();
+     if (isPlaying) audioCtx.resume().then(() => audio.play().catch(() => {}));
+     return;
+   }

    if (track.handle) {
      ...
```

**Important:** Do not call `revokeObjectURL` for static `src` paths — only for blob URLs.

### 5. Visualizer — wire existing `analyser`

Add after HUD setup:

```javascript
const viz = document.getElementById('viz');
const vizCtx = viz.getContext('2d');
const freqData = new Uint8Array(analyser.frequencyBinCount);

function resizeViz() {
  viz.width = innerWidth;
  viz.height = innerHeight;
}
addEventListener('resize', resizeViz);
resizeViz();

function drawViz() {
  requestAnimationFrame(drawViz);
  analyser.getByteFrequencyData(freqData);
  const w = viz.width, h = viz.height;
  vizCtx.fillStyle = 'rgba(0,0,0,0.15)';
  vizCtx.fillRect(0, 0, w, h);
  const barW = w / freqData.length;
  for (let i = 0; i < freqData.length; i++) {
    const barH = (freqData[i] / 255) * h * 0.45;
    vizCtx.fillStyle = `rgba(0,255,170,${0.25 + freqData[i] / 512})`;
    vizCtx.fillRect(i * barW, h - barH, barW - 1, barH);
  }
}
drawViz();
```

Runs idle when silent (flat bars) — no extra toggle needed for Day-0.

### 6. `tracks.json` — seed manifest

```json
{
  "tracks": [
    {
      "title": "GitJuke",
      "file": "audio/01_-_gitjuke_-_cxmx.wav"
    }
  ]
}
```

### 7. `scripts/gen-tracks.ps1` — maintenance one-liner

```powershell
# Run from repo root: .\scripts\gen-tracks.ps1
$tracks = Get-ChildItem audio -File | Where-Object { $_.Extension -match '\.(mp3|wav|ogg|m4a|aac|flac)$' } | Sort-Object Name
$list = $tracks | ForEach-Object { @{ title = $_.BaseName -replace '_',' '; file = "audio/$($_.Name)" } }
@{ tracks = @($list) } | ConvertTo-Json -Depth 3 | Set-Content tracks.json -Encoding UTF8
Write-Host "tracks.json updated ($($tracks.Count) tracks)"
```

### 8. Preserve all v.01 taste elements

- Auto-hide HUD (`HIDE_DELAY = 2200`, mouse/click/key activity)
- `#00ffaa` accents, dark HUD panel, range `accent-color`
- Keyboard: Space play/pause, ←/→ prev/next, S shuffle
- `beforeunload` blob cleanup
- **Browse Folder** button stays visible (hidden on mobile optional — defer to iteration ticket)

---

## Deployment

### Day-0 push checklist

1. Copy v.01 into `index.html`; apply diffs above
2. Confirm `audio/01_-_gitjuke_-_cxmx.wav` is committed (check file size — GitHub warns >50 MB; typical WAV OK)
3. Add `tracks.json`, `.nojekyll`, `README.md`, `scripts/gen-tracks.ps1`
4. `git add . && git commit -m "feat: GitJuked v1"`
5. Run **Repo Setup Commands** section
6. Wait 1–3 minutes; open `https://cxmx-dev.github.io/GitJuked/`
7. Smoke test: play seed track, scrub timeline, volume, shuffle, keyboard shortcuts
8. Local test: open `index.html` via `npx serve .` or Live Server — Browse Folder still works

### Cache note

`tracks.json` fetched with `cache: 'no-store'` so new tracks appear immediately after Pages rebuild. Audio files cache normally (good for repeat visits).

---

## Add-Audio Workflow

**How I add a new track in <60 seconds:**

1. Drop `my-new-banger.wav` into `audio/` (GitHub web: **Add file → Upload files** drag to `audio/`)
2. Run one line locally (or in CI later):
   ```powershell
   .\scripts\gen-tracks.ps1
   ```
3. Commit and push:
   ```powershell
   git add audio/ tracks.json && git commit -m "track: my-new-banger" && git push
   ```
4. Done — live at Pages URL within ~1–2 min. No HTML edits required.

**Replace a track:** Same filename in `audio/` → overwrite → push. Update title in `tracks.json` only if filename changed.

---

## Polish & Portfolio Wins

Five fast upgrades that signal *Creative Technologist who ships clean interactive audio experiences*:

1. **README hero** — One screenshot GIF of the visualizer + HUD; live badge linking to Pages URL; keyboard shortcut table
2. **Branded title flash** — On first load, 1.2s fade of "GitJuked" in `#00ffaa` center-screen before HUD-only mode (CSS animation, no framework)
3. **Track display names** — `gen-tracks.ps1` converts `01_-_gitjuke_-_cxmx` → `01 - gitjuke - cxmx` (already in script); show in `#trackInfo` with elapsed/total `mm:ss`
4. **OG meta tags** — `og:title`, `og:description`, `theme-color: #00ffaa` for link previews in Slack/Discord/LinkedIn
5. **Repo About blurb** — GitHub repo description: *"Zero-dependency cyber HUD audio player — GitHub Pages jukebox"* + Pages URL in Website field

---

## Next Iteration Tickets

| Ticket | Scope | Est. |
|--------|-------|------|
| **T1 — Visualizer skin** | Circular/radial spectrum option, beat-reactive glow pulse, mute-friendly idle state | 45 min |
| **T2 — Metadata display** | Parse filename or optional `artist`/`album` fields in `tracks.json`; two-line `#trackInfo` | 30 min |
| **T3 — Fork → Your Juke** | README section + badge: "Fork this repo, replace `audio/`, run `gen-tracks.ps1`, enable Pages" | 20 min |

### Timeline

- **Day-0 (today):** Dual-mode `index.html`, seed track, Pages live — portfolio-linkable
- **Day-1:** T1 visualizer skin
- **Day-2:** T2 metadata + T3 fork CTA

---

## Source Reference

v.01 baseline (migrate from `E:\Code-Y\anonplayer.html`, second block):

- `AudioContext` + `AnalyserNode` (`fftSize = 256`) already wired via `createMediaElementSource`
- Playlist: `{ name, handle }` from `showDirectoryPicker`
- No visualizer draw loop yet — analyser is ready for Ticket T1 expansion

Seed audio already at: `E:\Code-Y\GitJuked\audio\01_-_gitjuke_-_cxmx.wav`

---

*Local-first. Minimal tools. Zero heavy engines. Ship the link.*