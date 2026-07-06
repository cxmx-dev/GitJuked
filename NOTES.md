# Quick commands

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