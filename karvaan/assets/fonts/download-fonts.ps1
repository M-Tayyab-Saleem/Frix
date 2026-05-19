# Frix - Font Download Script
# Run this PowerShell script to download required fonts
# Usage: .\assets\fonts\download-fonts.ps1

$fontsDir = $PSScriptRoot
$baseUrl = "https://github.com/google/fonts/raw/main/ofl"

# Font URLs from Google Fonts
$fontFiles = @(
    # Noto Serif
    @{ Name = "NotoSerif-Bold.ttf"; Url = "$baseUrl/notoserif/static/NotoSerif-Bold.ttf" },
    @{ Name = "NotoSerif-SemiBold.ttf"; Url = "$baseUrl/notoserif/static/NotoSerif-SemiBold.ttf" },
    @{ Name = "NotoSerif-Regular.ttf"; Url = "$baseUrl/notoserif/static/NotoSerif-Regular.ttf" },
    # Manrope
    @{ Name = "Manrope-Regular.ttf"; Url = "$baseUrl/manrope/static/Manrope-Regular.ttf" },
    @{ Name = "Manrope-Medium.ttf"; Url = "$baseUrl/manrope/static/Manrope-Medium.ttf" },
    @{ Name = "Manrope-SemiBold.ttf"; Url = "$baseUrl/manrope/static/Manrope-SemiBold.ttf" }
)

Write-Host "Downloading fonts..." -ForegroundColor Cyan

foreach ($font in $fontFiles) {
    $outputPath = Join-Path $fontsDir $font.Name
    Write-Host "  Downloading $($font.Name)..." -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $font.Url -OutFile $outputPath -UseBasicParsing
        Write-Host "  ? $($font.Name) downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "  ? Failed to download $($font.Name): $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    You may need to download manually from Google Fonts" -ForegroundColor Yellow
    }
}

Write-Host "`nFont download complete!" -ForegroundColor Green
Write-Host "Verify files in: $fontsDir" -ForegroundColor Gray
