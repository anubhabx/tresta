# Tresta Widget Testing - Quick Start
# This script helps you test all widget layouts

Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "🎨 Tresta Widget Layout Testing Suite" -NoNewline -ForegroundColor White
Write-Host "     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if API is running
Write-Host "🔍 Checking if API is running..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ API is running on http://localhost:8000`n" -ForegroundColor Green
} catch {
    Write-Host "❌ API is NOT running`n" -ForegroundColor Red
    Write-Host "Please start the API first:" -ForegroundColor Yellow
    Write-Host "  pnpm dev --filter api`n" -ForegroundColor White
    
    $startApi = Read-Host "Do you want to start the API now? (y/n)"
    if ($startApi -eq 'y' -or $startApi -eq 'Y') {
        Write-Host "`nStarting API in a new window...`n" -ForegroundColor Green
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd c:\dev\tresta; pnpm dev --filter api"
        Start-Sleep -Seconds 3
    } else {
        Write-Host "`nPlease start the API manually and run this script again.`n" -ForegroundColor Red
        exit
    }
}

# Get widget ID
Write-Host "📋 You need a Widget ID from your database.`n" -ForegroundColor Yellow
Write-Host "Options to get a Widget ID:" -ForegroundColor White
Write-Host "  1. From Dashboard (http://localhost:3000 → Projects → Widgets tab)" -ForegroundColor Gray
Write-Host "  2. From Prisma Studio (see WIDGET_TESTING_QUERIES.md)" -ForegroundColor Gray
Write-Host "  3. Manual database query`n" -ForegroundColor Gray

$widgetId = Read-Host "Enter your Widget ID (or press Enter to open Prisma Studio)"

if ([string]::IsNullOrWhiteSpace($widgetId)) {
    Write-Host "`nOpening Prisma Studio...`n" -ForegroundColor Green
    Write-Host "Navigate to the 'Widget' table and copy an ID`n" -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd c:\dev\tresta\packages\database; pnpm prisma studio"
    Start-Sleep -Seconds 2
    
    $widgetId = Read-Host "`nEnter the Widget ID you copied"
    
    if ([string]::IsNullOrWhiteSpace($widgetId)) {
        Write-Host "`n❌ No Widget ID provided. Exiting.`n" -ForegroundColor Red
        exit
    }
}

Write-Host "`n✅ Using Widget ID: " -NoNewline -ForegroundColor Green
Write-Host $widgetId -ForegroundColor Cyan

# Update the HTML file
Write-Host "`n📝 Updating test-all-layouts.html with your Widget ID..." -ForegroundColor Yellow

$htmlPath = "c:\dev\tresta\packages\widget\test-all-layouts.html"
$htmlContent = Get-Content $htmlPath -Raw

if ($htmlContent -match "const WIDGET_ID = '([^']+)';") {
    $oldId = $matches[1]
    $htmlContent = $htmlContent -replace "const WIDGET_ID = '$oldId';", "const WIDGET_ID = '$widgetId';"
    Set-Content -Path $htmlPath -Value $htmlContent
    Write-Host "✅ Widget ID updated in test file`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not automatically update Widget ID" -ForegroundColor Yellow
    Write-Host "Please manually update WIDGET_ID in test-all-layouts.html`n" -ForegroundColor Yellow
}

# Start widget dev server
Write-Host "🚀 Starting widget dev server...`n" -ForegroundColor Yellow

Set-Location "c:\dev\tresta\packages\widget"

Write-Host "Opening browser at http://localhost:3001/test-all-layouts.html`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "You should see all 5 widget layouts:" -NoNewline -ForegroundColor White
Write-Host "           ║" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "1. Carousel (single slide with navigation)" -NoNewline -ForegroundColor White
Write-Host "    ║" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "2. Grid (multi-column responsive)" -NoNewline -ForegroundColor White
Write-Host "          ║" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "3. Masonry (Pinterest-style)" -NoNewline -ForegroundColor White
Write-Host "                ║" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "4. Wall (minimal waterfall)" -NoNewline -ForegroundColor White
Write-Host "                ║" -ForegroundColor Cyan
Write-Host "║  " -NoNewline -ForegroundColor Cyan
Write-Host "5. List (vertical stack)" -NoNewline -ForegroundColor White
Write-Host "                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Start dev server with the test page
Start-Process "http://localhost:3001/test-all-layouts.html"
Start-Sleep -Seconds 1

pnpm dev
