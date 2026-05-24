$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "velo-eas-temp"
$easTempRoot = Join-Path $tempRoot "eas-cli-nodejs"

New-Item -ItemType Directory -Force -Path $easTempRoot | Out-Null

# Clear any leftover read-only flags from prior failed shallow clones in the dedicated temp area.
if (Test-Path $easTempRoot) {
  Get-ChildItem -Path $easTempRoot -Force -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      $_.Attributes = $_.Attributes -band (-bnot [System.IO.FileAttributes]::ReadOnly)
    } catch {}
  }
}

$env:TEMP = $tempRoot
$env:TMP = $tempRoot

Write-Host "Using TEMP=$env:TEMP"
Write-Host "Using TMP=$env:TMP"

npx -p node@20 -p eas-cli eas build --platform ios --profile development --clear-cache
