# Quick commands

Replace `GitJuked` with your clone folder name.

## Start (sync + push + preview) — use this
```powershell
cd GitJuked
.\scripts\start.ps1
```

## Local preview only
```powershell
cd GitJuked
.\scripts\preview.ps1
```
Do **not** type `run` before `npx` — that is not valid PowerShell.

## First-time GitHub Pages deploy
```powershell
.\scripts\auth-github.ps1
.\scripts\push-pages.ps1
```

Docs: [deploy-auth-annotation.md](docs/deploy-auth-annotation.md) · [visual callouts](docs/deploy-auth-visual.html)

## Privacy (Free plan)

- **Share:** https://cxmx-dev.github.io/GitJuked/
- **Repo is public** on Free — share player link only, not the GitHub repo URL
- **Docs:** no local drive paths or session codes in tracked files
- Details: [docs/repo-privacy.md](docs/repo-privacy.md)