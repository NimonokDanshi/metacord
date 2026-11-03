param(
    [switch]$Tunnel,
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       Metacord Dev Environment        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 環境変数の確認
if (-not (Test-Path ".env.local")) {
    Write-Warning ".env.local が見つかりません。必要に応じて .env.local を作成してください。"
}

# 2. ポートの確認
$portInUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "[INFO] ポート $Port は既に起動・リッスン中です (PID: $($portInUse.OwningProcess))。" -ForegroundColor Yellow
}

if (-not $Tunnel) {
    Write-Host "`n[MODE] 通常ブラウザ開発モード (モック)" -ForegroundColor Green
    Write-Host "URL: http://localhost:$Port" -ForegroundColor Green
    Write-Host "※ 終了するには Ctrl + C を押してください`n" -ForegroundColor Gray
    npm run dev
    exit 0
}

# トンネルモード
Write-Host "`n[MODE] Discord 実機テストモード (Cloudflare Tunnel)" -ForegroundColor Magenta
Write-Host "1. Next.js サーバーの状態を確認..." -ForegroundColor Gray

if (-not $portInUse) {
    Write-Host "   Next.js 開発サーバーを別ウィンドウで起動します..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Metacord Next.js Dev Server (Port: $Port) ---' -ForegroundColor Cyan; npm run dev"
    Start-Sleep -Seconds 3
} else {
    Write-Host "   既存の Next.js サーバー (Port: $Port) を利用します。" -ForegroundColor Green
}

Write-Host "2. トンネルを発行します..." -ForegroundColor Cyan

# cloudflared のパス判定（PATH または Program Files）
$cloudflaredBin = $null
if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    $cloudflaredBin = "cloudflared"
} elseif (Test-Path "C:\Program Files (x86)\cloudflared\cloudflared.exe") {
    $cloudflaredBin = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
}

Write-Host "`n========================================================" -ForegroundColor Yellow
Write-Host " 【Discord Developer Portal での設定手順】" -ForegroundColor Yellow
Write-Host " 1. 下記に表示される https://*.trycloudflare.com のホスト名をコピー" -ForegroundColor Yellow
Write-Host " 2. Discord Developer Portal > Metacord > Embedded App SDK" -ForegroundColor Yellow
Write-Host " 3. URL Mappings の Prefix '/' の Target に貼り付けて保存" -ForegroundColor Yellow
Write-Host "========================================================`n" -ForegroundColor Yellow

if ($cloudflaredBin) {
    Write-Host "[Tunnel Engine] cloudflared を実行します..." -ForegroundColor Green
    & $cloudflaredBin tunnel --url "http://localhost:$Port"
} else {
    Write-Host "[Tunnel Engine] cloudflared が未導入のため、npx untun を実行します..." -ForegroundColor Yellow
    npx untun tunnel --port $Port
}
