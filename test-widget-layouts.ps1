# Tresta Widget Tester - Setup Helper

Write-Host "`n🎨 Tresta Widget Layout Tester Setup`n" -ForegroundColor Cyan

Write-Host "This script will help you get a widget ID to test the layouts.`n" -ForegroundColor Yellow

Write-Host "Step 1: Make sure your API is running" -ForegroundColor Green
Write-Host "  Run in another terminal: " -NoNewline
Write-Host "pnpm dev --filter api`n" -ForegroundColor White

Write-Host "Step 2: Get a Widget ID from your database" -ForegroundColor Green
Write-Host "  Option A - From your dashboard:" -ForegroundColor White
Write-Host "    1. Open http://localhost:3000 in your browser"
Write-Host "    2. Go to any project"
Write-Host "    3. Click the 'Widgets' tab"
Write-Host "    4. Create a new widget or copy an existing widget ID`n"

Write-Host "  Option B - From database directly:" -ForegroundColor White
Write-Host "    Run this in your database (Prisma Studio):"
Write-Host "    " -NoNewline
Write-Host "SELECT id, embedType FROM Widget LIMIT 1;" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 3: Update the test file" -ForegroundColor Green
Write-Host "  1. Open: " -NoNewline
Write-Host "packages/widget/test-all-layouts.html" -ForegroundColor White
Write-Host "  2. Find line: " -NoNewline
Write-Host "const WIDGET_ID = 'YOUR_WIDGET_ID';" -ForegroundColor Yellow
Write-Host "  3. Replace " -NoNewline
Write-Host "YOUR_WIDGET_ID" -ForegroundColor Yellow -NoNewline
Write-Host " with your actual widget ID`n"

Write-Host "Step 4: Make sure the project is PUBLIC" -ForegroundColor Green
Write-Host "  The widget's project must have visibility set to PUBLIC"
Write-Host "  Check in your database: " -NoNewline
Write-Host "SELECT visibility FROM Project WHERE id = 'your-project-id';" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 5: Ensure you have published testimonials" -ForegroundColor Green
Write-Host "  The widget needs some testimonials to display"
Write-Host "  Check: " -NoNewline
Write-Host "SELECT COUNT(*) FROM Testimonial WHERE projectId = 'your-project-id' AND published = true;" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 6: Start the widget dev server" -ForegroundColor Green
Write-Host "  Run: " -NoNewline
Write-Host "cd packages/widget && pnpm dev`n" -ForegroundColor White

Write-Host "Step 7: Open the test page" -ForegroundColor Green
Write-Host "  The dev server should auto-open: " -NoNewline
Write-Host "http://localhost:3001/test-all-layouts.html" -ForegroundColor Cyan
Write-Host "  If not, open it manually in your browser`n"

Write-Host "========================================`n" -ForegroundColor Cyan

$response = Read-Host "Do you want to start the widget dev server now? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "`nStarting widget dev server...`n" -ForegroundColor Green
    Set-Location packages/widget
    pnpm dev
} else {
    Write-Host "`nOkay! Run the commands above when you're ready.`n" -ForegroundColor Yellow
}
