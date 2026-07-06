---
title: GitJuked — GitHub Pages Media Player
project: GitJuked
github_user: cxmx-dev
github_url: https://github.com/cxmx-dev
pages_url: https://cxmx-dev.github.io/GitJuked/
source: ANON-AUDIO-PLAYER v.01 (single-file HTML + File System Access API)
seed_track: audio/playlists/instrumentals/
stack: vanilla HTML/CSS/JS — zero build required for Day-0
created: 2026-07-06
status: live — Pages deployed; start.ps1 workflow active
privacy: GitHub Free — public repo; share player URL only
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

**Success metric:** After following this plan, `https://cxmx-dev.github.io/GitJuked/` looks and feels like a finished demo — black canvas, `#00ffaa` HUD, auto-hide controls, keyboard shortcuts, mobile-friendly ranges, and a live visualizer hooked to the existing `AnalyserNode`.

---

## Repo Setup Commands

Run from the repo root after files are created (Day-0 checklist below).

```powershell
cd GitJuked

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

### Repo visibility vs. public player link

See [docs/repo-privacy.md](docs/repo-privacy.md) for the full table. Summary:

| Setup | `cxmx-dev.github.io/GitJuked/` | `github.com/cxmx-dev/GitJuked` browsable? |
|-------|-------------------------------|---------------------------------------------|
| Public repo (Free, **current**) | Works | Yes |
| Private repo + **GitHub Pro** | Works (Pages stays public) | No (for strangers) |
| Private repo + **Free** | **Breaks** | Private |

**Current choice (Free):** repo stays public; share only the Pages URL. Docs omit local paths and session codes. For hidden source, upgrade to Pro (see [docs/repo-privacy.md](docs/repo-privacy.md)).

---

## Folder Tree

```
GitJuked/
├── .nojekyll
├── .gitignore
├── index.html                # v.01 + dual loader + visualizer + playlist-helpers.js
├── tracks.json               # Generated from audio/ (do not hand-edit long-term)
├── package.json              # npm test, test:launch, test:annotation
├── audio/
│   └── playlists/instrumentals/   # WAV/MP3/OGG — any subfolder under audio/ OK
├── docs/
│   ├── repo-privacy.md
│   ├── deploy-auth-annotation.md
│   ├── deploy-auth-visual.html
│   └── images/github-auth-success.png
├── scripts/
│   ├── start.ps1             # PRIMARY: sync → git push → preview
│   ├── gen-tracks.ps1        # Recursive audio/ → tracks.json
│   ├── audio-scan.js         # Shared scan logic (Node tests)
│   ├── playlist-helpers.js   # Manifest normalize (browser + tests)
│   ├── preview.ps1
│   ├── auth-github.ps1
│   ├── push-pages.ps1
│   └── gh.ps1
├── tests/
│   ├── playlist-helpers.test.js
│   ├── annotation-doc.test.js
│   └── launch-check.mjs
├── README.md
├── NOTES.md
└── PLAN.md
```

**Optional later:**

```
├── favicon.svg
├── CNAME
└── scripts/deploy-public.ps1   # Split-repo deploy (Option C in repo-privacy.md)
```

---

## Code Diffs

Base: **v.01** single-file HTML (cleaner style block with `input[type="range"]#volume { width:90px }` and `input[type="range"]#timeline { flex:1 }`).

### 1. `<head>` — title, meta, visualizer layer

```diff
- <title>ANON-AUDIO-PLAYER 2</title>
+ <title>GitJuked</title>
+ <meta name="description" content="GitJuked — minimal cyber-green audio player">
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
// Hosted:  { name: "01 - gitjuke - cxmx", src: "audio/playlists/instrumentals/01_-_gitjuke_-_cxmx.wav" }
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
      "title": "01 - gitjuke - cxmx",
      "file": "audio/playlists/instrumentals/01_-_gitjuke_-_cxmx.wav"
    }
  ]
}
```

### 7. `scripts/gen-tracks.ps1` — recursive scan

Scans `audio/` recursively; writes UTF-8 **without BOM**. Prefer `.\scripts\start.ps1` (sync + push + preview) over running `gen-tracks.ps1` alone.

### 8. Preserve all v.01 taste elements

- Auto-hide HUD (`HIDE_DELAY = 2200`, mouse/click/key activity)
- `#00ffaa` accents, dark HUD panel, range `accent-color`
- Keyboard: Space play/pause, ←/→ prev/next, S shuffle
- `beforeunload` blob cleanup
- **Browse Folder** button stays visible (hidden on mobile optional — defer to iteration ticket)

---

## Deployment

### Deploy checklist (done)

1. `index.html` shipped with dual loader + visualizer
2. Audio under `audio/playlists/instrumentals/` (watch GitHub 50 MB/file warning)
3. `.\scripts\auth-github.ps1` → `.\scripts\push-pages.ps1` for first push
4. Ongoing: `.\scripts\start.ps1` after adding tracks
5. Verify: https://cxmx-dev.github.io/GitJuked/ + `npm test`

### Cache note

`tracks.json` fetched with `cache: 'no-store'` so new tracks appear immediately after Pages rebuild. Audio files cache normally (good for repeat visits).

### Day-0+ workflow (`start.ps1`)

```powershell
.\scripts\start.ps1   # scan audio/ → tracks.json → git push if changed → local preview
```

Audio may live in subfolders (e.g. `audio/playlists/instrumentals/`); `gen-tracks.ps1` scans recursively.

---

## Add-Audio Workflow

**How I add a new track in <60 seconds:**

1. Drop `my-new-banger.wav` into `audio/` (any subfolder OK)
2. Run:
   ```powershell
   .\scripts\start.ps1
   ```
   Or manually: `.\scripts\gen-tracks.ps1` then `git add audio/ tracks.json && git commit -m "track: …" && git push`
3. Done — live at Pages URL within ~1–2 min. No HTML edits required.

**Replace a track:** Same filename in `audio/` → overwrite → push. Update title in `tracks.json` only if filename changed.

---

## Polish wins

Five fast upgrades for a sharper public demo:

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

- **Day-0 (today):** Dual-mode `index.html`, seed track, Pages live
- **Day-1:** T1 visualizer skin
- **Day-2:** T2 metadata + T3 fork CTA

---

## Source Reference

v.01 baseline:

- `AudioContext` + `AnalyserNode` (`fftSize = 256`) already wired via `createMediaElementSource`
- Playlist: `{ name, handle }` from `showDirectoryPicker`
- Visualizer draw loop wired in Day-0 `index.html`

Seed audio under `audio/playlists/instrumentals/`

---

*Local-first. Minimal tools. Zero heavy engines. Ship the link.*