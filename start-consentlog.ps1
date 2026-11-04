# ConsentLog Enterprise v2.0 - One-Click PowerShell Launcher
$Host.UI.RawUI.WindowTitle = "ConsentLog Enterprise v2.0"
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  CONSENTLOG ENTERPRISE EDITION v2.0" -ForegroundColor White
Write-Host "  Intelligent Consent & Preference Management Platform" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

# Free up port 5000 or 5173 if an old background instance is still holding them
$ports = @(5000, 5173)
foreach ($p in $ports) {
  $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($conn) {
    foreach ($c in $conn) {
      Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
  }
}

Start-Job -ScriptBlock {
  Start-Sleep -Seconds 5
  Start-Process "http://localhost:5173"
} | Out-Null

npm run dev

