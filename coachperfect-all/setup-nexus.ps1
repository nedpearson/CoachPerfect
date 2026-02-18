# ═══════════════════════════════════════════════════════════════
#  CoachPerfect — Nexus Registration + Launch Script
#  Run from PowerShell as: .\setup-nexus.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppName = "CoachPerfect"
$Port = 3008

Write-Host ""
Write-Host "  CoachPerfect Setup" -ForegroundColor Cyan
Write-Host "  ==================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verify we're in the right place ───────────────────────
Write-Host "  [1/5] Checking app directory..." -ForegroundColor Yellow

if (-not (Test-Path "$AppDir\server.js")) {
    Write-Error "server.js not found in $AppDir. Run this script from inside coachperfect-all\"
    exit 1
}

Write-Host "        OK: $AppDir" -ForegroundColor Green

# ── 2. npm install ────────────────────────────────────────────
Write-Host "  [2/5] Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "$AppDir\node_modules")) {
    try {
        Push-Location $AppDir
        npm install --silent
        Pop-Location
        Write-Host "        OK: npm install complete" -ForegroundColor Green
    } catch {
        Pop-Location
        Write-Error "npm install failed: $_"
        exit 1
    }
} else {
    Write-Host "        OK: node_modules already present" -ForegroundColor Green
}

# ── 3. Find Nexus Controller registry ────────────────────────
Write-Host "  [3/5] Searching for Nexus Controller registry..." -ForegroundColor Yellow

$NexusCandidates = @(
    "$env:APPDATA\NexusController\services.json",
    "$env:APPDATA\NexusController\registry.json",
    "$env:APPDATA\NexusController\registry.db",
    "$env:APPDATA\Nexus\services.json",
    "$env:APPDATA\Nexus\registry.json",
    "$env:LOCALAPPDATA\NexusController\services.json",
    "$env:LOCALAPPDATA\NexusController\registry.json",
    "$env:LOCALAPPDATA\Nexus\services.json",
    "$env:LOCALAPPDATA\Nexus\registry.json",
    "C:\Program Files\NexusController\config\services.json",
    "C:\Program Files\NexusController\config\registry.json",
    "C:\Program Files (x86)\NexusController\config\services.json",
    "C:\NexusController\services.json",
    "C:\NexusController\registry.json",
    "$env:USERPROFILE\.nexus\services.json",
    "$env:USERPROFILE\.nexus\registry.json",
    "$env:USERPROFILE\nexus\services.json",
    "$env:USERPROFILE\nexus\registry.json"
)

# Also search recursively in common locations
$SearchRoots = @(
    "$env:APPDATA",
    "$env:LOCALAPPDATA",
    "$env:USERPROFILE",
    "C:\Program Files",
    "C:\Program Files (x86)",
    "C:\"
)

$NexusRegistryFile = $null

# First check known candidates
foreach ($candidate in $NexusCandidates) {
    if (Test-Path $candidate) {
        $NexusRegistryFile = $candidate
        break
    }
}

# Broader search if not found
if (-not $NexusRegistryFile) {
    Write-Host "        Scanning filesystem for Nexus registry files..." -ForegroundColor DarkYellow
    foreach ($root in $SearchRoots) {
        if (-not (Test-Path $root)) { continue }
        try {
            $found = Get-ChildItem -Path $root -Recurse -ErrorAction SilentlyContinue -Depth 5 |
                Where-Object { $_.Name -match "(nexus|services|registry)" -and $_.Extension -match "\.(json|db)" } |
                Where-Object { $_.FullName -match -join("nexus","controller","\.nexus" -split ",") } |
                Select-Object -First 1 -ExpandProperty FullName
            if ($found) {
                $NexusRegistryFile = $found
                break
            }
        } catch { }
    }
}

# Also look for nexus-related processes to find install path
if (-not $NexusRegistryFile) {
    $nexusProc = Get-Process | Where-Object { $_.Name -match "nexus" } | Select-Object -First 1
    if ($nexusProc) {
        try {
            $procPath = $nexusProc.MainModule.FileName
            $procDir = Split-Path -Parent $procPath
            $candidates2 = @(
                "$procDir\services.json",
                "$procDir\registry.json",
                "$procDir\config\services.json",
                "$procDir\config\registry.json"
            )
            foreach ($c in $candidates2) {
                if (Test-Path $c) {
                    $NexusRegistryFile = $c
                    break
                }
            }
            if (-not $NexusRegistryFile) {
                # Create one next to the process
                $NexusRegistryFile = "$procDir\services.json"
            }
        } catch { }
    }
}

# If still not found — create in the most likely AppData location
if (-not $NexusRegistryFile) {
    $nexusDir = "$env:APPDATA\NexusController"
    if (-not (Test-Path $nexusDir)) {
        New-Item -ItemType Directory -Path $nexusDir -Force | Out-Null
    }
    $NexusRegistryFile = "$nexusDir\services.json"
    Write-Host "        Not found — will create at: $NexusRegistryFile" -ForegroundColor DarkYellow
} else {
    Write-Host "        Found: $NexusRegistryFile" -ForegroundColor Green
}

# ── 4. Register CoachPerfect in Nexus registry ────────────────
Write-Host "  [4/5] Registering CoachPerfect in Nexus..." -ForegroundColor Yellow

$AppEntry = [ordered]@{
    id          = "coachperfect"
    name        = "CoachPerfect"
    description = "Coaching intelligence platform - Business Health Score, AI Session Prep, ROI Reports"
    version     = "1.0.0"
    path        = $AppDir
    entry       = "server.js"
    command     = "node server.js"
    port        = $Port
    autoStart   = $true
    healthCheck = [ordered]@{
        url      = "http://localhost:$Port/health"
        interval = 30
        timeout  = 5
    }
    env         = [ordered]@{
        PORT     = "$Port"
        WS_PORT  = "3579"
        NODE_ENV = "production"
    }
    links       = [ordered]@{
        app        = "http://localhost:$Port"
        health     = "http://localhost:$Port/health"
        diagnostic = "http://localhost:$Port/diagnostic.html"
        dashboard  = "http://localhost:$Port/dashboard.html"
    }
    tags        = @("coaching", "pwa", "business")
    registered  = (Get-Date -Format "o")
}

# Load existing registry or start fresh
$registry = $null
if (Test-Path $NexusRegistryFile) {
    $content = Get-Content $NexusRegistryFile -Raw -ErrorAction SilentlyContinue
    if ($content) {
        try {
            $registry = $content | ConvertFrom-Json
        } catch {
            Write-Host "        Warning: existing registry could not be parsed — creating fresh" -ForegroundColor DarkYellow
        }
    }
}

# Normalize registry to a hashtable with an 'apps' or 'services' array
if (-not $registry) {
    $registry = [ordered]@{ apps = @() }
}

# Try common top-level keys: apps, services, applications, entries
$listKey = $null
foreach ($key in @("apps","services","applications","entries","items")) {
    if ($registry.PSObject.Properties.Name -contains $key) {
        $listKey = $key
        break
    }
}
if (-not $listKey) {
    # Add 'apps' key
    $registry | Add-Member -NotePropertyName "apps" -NotePropertyValue @() -Force
    $listKey = "apps"
}

# Remove any existing CoachPerfect entry
$existingList = @($registry.$listKey | Where-Object { $_.id -ne "coachperfect" })
$newList = $existingList + ($AppEntry | ConvertTo-Json -Depth 10 | ConvertFrom-Json)
$registry.$listKey = $newList

# Write back
$registry | ConvertTo-Json -Depth 10 | Set-Content -Path $NexusRegistryFile -Encoding UTF8
Write-Host "        OK: registered in $NexusRegistryFile" -ForegroundColor Green

# ── 5. Kill any existing process on port 3008 + start app ────
Write-Host "  [5/5] Starting CoachPerfect on port $Port..." -ForegroundColor Yellow

# Kill anything already using the port
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $pid2kill = ($existing | Select-Object -First 1).OwningProcess
    Write-Host "        Port $Port in use by PID $pid2kill — stopping it..." -ForegroundColor DarkYellow
    Stop-Process -Id $pid2kill -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Start the server as a background job
$job = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    $env:PORT = "3008"
    $env:WS_PORT = "3579"
    node server.js
} -ArgumentList $AppDir

Start-Sleep -Seconds 3

# ── Health check ──────────────────────────────────────────────
Write-Host ""
Write-Host "  Confirming health..." -ForegroundColor Yellow

$maxRetries = 5
$healthy = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 4 -ErrorAction Stop
        $healthy = $true
        break
    } catch {
        Write-Host "        Waiting... (attempt $i/$maxRetries)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
    }
}

Write-Host ""

if ($healthy) {
    Write-Host "  ╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║  CoachPerfect is LIVE                         ║" -ForegroundColor Green
    Write-Host "  ║                                               ║" -ForegroundColor Green
    Write-Host "  ║  App:     http://localhost:3008               ║" -ForegroundColor Green
    Write-Host "  ║  Health:  http://localhost:3008/health        ║" -ForegroundColor Green
    Write-Host "  ║                                               ║" -ForegroundColor Green
    Write-Host "  ║  Nexus registry updated:                      ║" -ForegroundColor Green
    Write-Host "  ║  $($NexusRegistryFile.PadRight(45)) ║" -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Health response:" -ForegroundColor Cyan
    $response | ConvertTo-Json
} else {
    Write-Host "  Health check FAILED after $maxRetries attempts." -ForegroundColor Red
    Write-Host "  Check if Node.js is installed and try: node server.js" -ForegroundColor Red
    Write-Host "  Job output:" -ForegroundColor Red
    Receive-Job $job
}

Write-Host ""
Write-Host "  NOTE: The server is running in a background PowerShell job (Job ID: $($job.Id))." -ForegroundColor DarkGray
Write-Host "  To run persistently, use: node server.js  (or let Nexus Controller manage it)" -ForegroundColor DarkGray
Write-Host ""
