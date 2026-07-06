# Repo privacy vs. live player link

**Player (share this):** https://cxmx-dev.github.io/GitJuked/  
**Repo (source on GitHub):** https://github.com/cxmx-dev/GitJuked

Goal: listeners use the player link without needing (or finding) the GitHub repo.

**Current choice: GitHub Free** — repo stays **public** (required for Pages). Share only the player URL in applications, posts, and DMs.

---

## How GitHub treats this

| Setup | Player link works? | Strangers can browse repo on GitHub? |
|-------|-------------------|--------------------------------------|
| **Public repo** (current on Free) | Yes | Yes — code, README, commits are visible |
| **Private repo + GitHub Pro** | Yes — same public Pages URL | No — 404 for non-collaborators |
| **Private repo + Free** | **No** — Pages stops / breaks | Repo is private |

On a **free personal account**, GitHub Pages only works from a **public** repository. Making `cxmx-dev/GitJuked` private without upgrading will break `https://cxmx-dev.github.io/GitJuked/`.

---

## Option A — GitHub Pro (cleanest)

~$4/month. **Private repo + public Pages site.**

1. Upgrade to [GitHub Pro](https://github.com/settings/billing/plans)
2. Repo **Settings → General → Danger zone → Change visibility → Private**
3. Repo **Settings → Pages** — confirm site visibility is **Public** (not “private Pages”; that requires Enterprise)
4. Player link keeps working; repo URL is hidden from the public

Visitors still download static files (`index.html`, `audio/`, `tracks.json`) when they play music — that is normal for any static site. They do **not** get the GitHub repo UI, git history, or README unless they have repo access.

---

## Option B — Stay on Free (selected)

Keep the repo **public**, but:

- Share only the **Pages link**, not the GitHub repo URL
- Docs use generic paths (no local drive letters or machine-specific folders)
- Accept that anyone who searches GitHub can still find the repo and source

---

## Option C — Split repos (Free, more manual)

- **Private** repo locally (or on GitHub) = full source + scripts + notes
- **Public** deploy-only repo = `index.html`, `audio/`, `tracks.json`, `.nojekyll` only
- Push deploy artifacts to the public repo; keep workflow scripts in private

Not implemented yet — say the word if you want `scripts/deploy-public.ps1`.

---

## Option D — Host elsewhere

Netlify, Cloudflare Pages, etc. can build from a private Git remote while serving a public site URL. More setup; GitHub Pages is already working.

---

## What listeners actually see

| They open… | They get… |
|------------|-----------|
| `https://cxmx-dev.github.io/GitJuked/` | Player UI + audio (intended) |
| `https://github.com/cxmx-dev/GitJuked` | Repo page (only if repo is public or they have access) |

Sharing **only** the `.github.io` link is enough for listen-only use. Hiding the repo requires **Pro + private repo** (Option A) or a split/deploy setup (Option C).

---

## Public content policy (tracked files)

To avoid exposing machine-specific details in the public repo:

- Docs use `cd GitJuked` — not local drive letters or user profile paths
- Auth walkthrough redacts one-time device codes (`XXXX-XXXX`)
- `NOTES.md`, `README.md`, and `PLAN.md` describe workflow only — no session artifacts

**Still public by nature:** GitHub username in URLs, audio filenames in `tracks.json`, and full source while repo stays public on Free.