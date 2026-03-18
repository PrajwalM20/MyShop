# ClickQueue Smart Starter — kills old processes then starts fresh
# Run this instead of "npm run dev"
# Usage: Right-click this file → "Run with PowerShell"

Write-Host "🔄 Stopping any old ClickQueue processes..." -ForegroundColor Yellow

# Kill anything on port 3000 and 5000
$ports = @(3000, 5000)
foreach ($port in $ports) {
    $pids = netstat -ano | Select-String ":$port " | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Where-Object { $_ -match '^\d+$' } | Sort-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -ne "0") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  ✅ Killed process $pid on port $port" -ForegroundColor Green
            } catch {}
        }
    }
}

Start-Sleep -Seconds 2
Write-Host ""
Write-Host "🚀 Starting ClickQueue..." -ForegroundColor Cyan
Set-Location "C:\Users\Prajwal\GITHUB\MyShop"
npm run dev