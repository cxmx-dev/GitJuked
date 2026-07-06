# GitHub CLI auth — uses full path (gh may not be on PATH yet)
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) {
  Write-Host 'GitHub CLI not found. Install: winget install GitHub.cli'
  exit 1
}
& $gh auth login -h github.com -p https -w