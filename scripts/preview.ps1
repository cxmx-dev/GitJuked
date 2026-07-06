# Local preview — no "run" prefix needed in PowerShell
Set-Location (Split-Path -Parent $PSScriptRoot)
Write-Host 'Starting local server at http://localhost:3000'
npx serve .