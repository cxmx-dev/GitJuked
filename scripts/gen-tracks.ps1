# Scan audio/ recursively and rewrite tracks.json
# Run from repo root: .\scripts\gen-tracks.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$audioRoot = Join-Path $root 'audio'
if (-not (Test-Path $audioRoot)) {
  Write-Host 'audio/ folder not found — created empty tracks.json'
  $list = @()
} else {
  $tracks = Get-ChildItem $audioRoot -Recurse -File |
    Where-Object { $_.Extension -match '\.(mp3|wav|ogg|m4a|aac|flac)$' } |
    Sort-Object FullName

  $list = $tracks | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
    @{
      title = ($_.BaseName -replace '_', ' ')
      file  = $rel
    }
  }
}

$json = (@{ tracks = @($list) } | ConvertTo-Json -Depth 3)
[System.IO.File]::WriteAllText((Join-Path $root 'tracks.json'), $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "tracks.json updated ($($list.Count) tracks)"