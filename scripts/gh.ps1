# Wrapper so you can run: .\scripts\gh.ps1 auth status
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) { throw 'GitHub CLI not found. Run: winget install GitHub.cli' }
& $gh @args