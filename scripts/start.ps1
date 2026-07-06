# GitJuked startup: sync audio/ -> tracks.json, push repo if changed, preview locally
# Run from anywhere: .\scripts\start.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '== GitJuked start ==' -ForegroundColor Cyan
Write-Host '[1/3] Scanning audio/ and updating tracks.json...'
& (Join-Path $PSScriptRoot 'gen-tracks.ps1')

Write-Host '[2/3] Checking git for audio/ or tracks.json changes...'
$dirty = git status --porcelain -- audio tracks.json 2>$null
if ($dirty) {
  git add audio tracks.json
  git commit -m "sync: update tracks from audio/"
  Write-Host 'Pushing to origin/main...'
  git push origin main
  Write-Host 'Repo updated — live site rebuilds in ~1-2 min.' -ForegroundColor Green
} else {
  Write-Host 'No track changes to push.' -ForegroundColor DarkGray
}

Write-Host '[3/3] Starting local preview...'
Write-Host 'Live: https://cxmx-dev.github.io/GitJuked/' -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'preview.ps1')