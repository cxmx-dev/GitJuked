# Quick commands

## Start (sync + push + preview)
```powershell
cd E:\Code-Y\GitJuked
.\scripts\start.ps1
```

## Local preview (PowerShell)
```powershell
cd E:\Code-Y\GitJuked
.\scripts\preview.ps1
```
Do **not** type `run` before `npx` — that is not valid PowerShell.

## Push to GitHub Pages (first time)
```powershell
.\scripts\auth-github.ps1
.\scripts\push-pages.ps1
```

Annotated auth screenshot + next steps: [docs/deploy-auth-annotation.md](docs/deploy-auth-annotation.md)

If `gh` is not recognized, use the full path:
```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' auth login -h github.com -p https -w
```

## Privacy (player link vs. repo)

- **Share:** https://cxmx-dev.github.io/GitJuked/ (listeners)
- **Hide repo on GitHub:** GitHub Pro + private repo (Free + private = Pages breaks)
- Details: [docs/repo-privacy.md](docs/repo-privacy.md) · README § Sharing the player vs. hiding the repo