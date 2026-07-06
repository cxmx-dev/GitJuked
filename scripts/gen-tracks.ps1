# Run from repo root: .\scripts\gen-tracks.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$tracks = Get-ChildItem audio -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -match '\.(mp3|wav|ogg|m4a|aac|flac)$' } |
  Sort-Object Name

$list = $tracks | ForEach-Object {
  @{
    title = ($_.BaseName -replace '_', ' ')
    file  = "audio/$($_.Name)"
  }
}

$json = (@{ tracks = @($list) } | ConvertTo-Json -Depth 3)
[System.IO.File]::WriteAllText((Join-Path $root 'tracks.json'), $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "tracks.json updated ($($tracks.Count) tracks)"