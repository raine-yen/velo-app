$ErrorActionPreference = "Continue"

$checks = @(
  @{ Name = "adb"; Command = "adb"; Args = @("version") },
  @{ Name = "emulator"; Command = "emulator"; Args = @("-version") },
  @{ Name = "java"; Command = "java"; Args = @("-version") }
)

$missing = @()

foreach ($check in $checks) {
  $path = (Get-Command $check.Command -ErrorAction SilentlyContinue).Source

  if (-not $path) {
    Write-Host "MISSING $($check.Name): not found on PATH"
    $missing += $check.Name
    continue
  }

  Write-Host "FOUND   $($check.Name): $path"
  & $check.Command @($check.Args) 2>&1 | Select-Object -First 3 | ForEach-Object {
    Write-Host "        $_"
  }
}

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Android native simulation is not ready yet."
  Write-Host "Install Android Studio, the Android SDK platform tools, an emulator image, and a JDK."
  Write-Host "Then add platform-tools, emulator, and Java to PATH before running npm run dev:android."
  exit 1
}

Write-Host ""
Write-Host "Android tooling looks ready. You can run npm run dev:android."
