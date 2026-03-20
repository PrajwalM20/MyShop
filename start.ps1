# ClickQueue Smart Starter
# Double-click this file OR right-click -> Run with PowerShell
# It kills port 5000 and 3000 first, then starts fresh every time

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ClickQueue Smart Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill port 5000
Write-Host "Clearing port 5000..." -ForegroundColor Yellow
$p5000 = netstat -ano 2>$null | Select-String ":5000 " | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' } | Sort-Object -Unique
foreach ($pid in $p5000) {
    if ($pid -and $pid -ne "0") {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed PID $pid on port 5000" -ForegroundColor Green
    }
}

# Kill port 3000
Write-Host "Clearing port 3000..." -ForegroundColor Yellow
$p3000 = netstat -ano 2>$null | Select-String ":3000 " | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' } | Sort-Object -Unique
foreach ($pid in $p3000) {
    if ($pid -and $pid -ne "0") {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed PID $pid on port 3000" -ForegroundColor Green
    }
}

Start-Sleep -Seconds 1
Write-Host ""
Write-Host "Starting ClickQueue..." -ForegroundColor Cyan
Write-Host "  Backend  -> http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:3000" -ForegroundColor Green
Write-Host ""

Set-Location "C:\Users\Prajwal\GITHUB\MyShop"
npm run dev