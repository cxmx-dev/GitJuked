# One-shot: create repo, push main, enable GitHub Pages
# Prereq: gh auth login (run once)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) { $gh = 'gh' }

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Not logged in. Run: .\scripts\auth-github.ps1'
  exit 1
}

git branch -M main 2>$null

$remotes = git remote 2>$null
if ($remotes -notcontains 'origin') {
  & $gh repo create cxmx-dev/GitJuked --public --source=. --remote=origin --push
} else {
  git push -u origin main
}

& $gh api repos/cxmx-dev/GitJuked/pages -X POST -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/' 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Pages may already be enabled — checking status...'
}

$url = & $gh api repos/cxmx-dev/GitJuked/pages --jq '.html_url' 2>$null
if ($url) {
  Write-Host "Pages URL: $url"
} else {
  Write-Host 'Pages URL (after build): https://cxmx-dev.github.io/GitJuked/'
}