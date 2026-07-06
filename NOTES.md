# Quick commands (local cheat sheet)

Replace `GitJuked` with your clone folder name.

## Start (sync + push + preview)
```powershell
cd GitJuked
.\scripts\start.ps1
```

## Local preview
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

Walkthrough: [docs/deploy-auth-annotation.md](docs/deploy-auth-annotation.md)

## Privacy (Free plan)

- **Share:** https://cxmx-dev.github.io/GitJuked/
- **Repo is public** on Free — do not link the GitHub repo URL publicly if you want listen-only sharing
- Details: [docs/repo-privacy.md](docs/repo-privacy.md)