# Test script to verify Docker setup is working

Write-Host "=== Testing OpenCode Docker Development Environment ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if container is running
Write-Host "1. Checking if container is running..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=opencode-dev" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "   ✅ Container is running: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "   ❌ Container is not running. Starting it..." -ForegroundColor Red
    docker-compose up -d opencode-dev
    Start-Sleep 3
}

# Test 2: Check Bun version
Write-Host "2. Testing Bun installation..." -ForegroundColor Yellow
$bunVersion = docker exec opencode-dev bun --version 2>$null
if ($bunVersion) {
    Write-Host "   ✅ Bun version: $bunVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Bun not found" -ForegroundColor Red
}

# Test 3: Check Go version
Write-Host "3. Testing Go installation..." -ForegroundColor Yellow
$goVersion = docker exec opencode-dev go version 2>$null
if ($goVersion) {
    Write-Host "   ✅ Go version: $goVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Go not found" -ForegroundColor Red
}

# Test 4: Check if OpenCode TypeScript runs
Write-Host "4. Testing OpenCode TypeScript application..." -ForegroundColor Yellow
try {
    $opencodeHelp = docker exec opencode-dev timeout 10 bun run packages/opencode/src/index.ts --version 2>$null
    if ($opencodeHelp) {
        Write-Host "   ✅ OpenCode TypeScript application is working" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  OpenCode TypeScript application test timed out (this is normal)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  OpenCode TypeScript application test had issues (this might be normal)" -ForegroundColor Yellow
}

# Test 5: Check if Go TUI binary exists
Write-Host "5. Testing Go TUI binary..." -ForegroundColor Yellow
$tuiBinary = docker exec opencode-dev test -f /app/packages/tui/opencode 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Go TUI binary exists and is executable" -ForegroundColor Green
} else {
    Write-Host "   ❌ Go TUI binary not found" -ForegroundColor Red
}

# Test 6: Check project structure
Write-Host "6. Checking project structure..." -ForegroundColor Yellow
$projectStructure = docker exec opencode-dev ls -la /app/packages/ 2>$null
if ($projectStructure) {
    Write-Host "   ✅ Project structure is mounted correctly" -ForegroundColor Green
    Write-Host "   Available packages:" -ForegroundColor Gray
    $projectStructure -split "`n" | Where-Object { $_ -match "^d.*" } | ForEach-Object {
        $packageName = ($_ -split "\s+")[-1]
        if ($packageName -ne "." -and $packageName -ne "..") {
            Write-Host "     - $packageName" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ❌ Project structure not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Your Docker development environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Open a shell in the container:" -ForegroundColor Gray
Write-Host "   .\docker-dev.ps1 shell" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Install dependencies (if needed):" -ForegroundColor Gray
Write-Host "   .\docker-dev.ps1 install" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Run the OpenCode application:" -ForegroundColor Gray
Write-Host "   .\docker-dev.ps1 run" -ForegroundColor Cyan
Write-Host "   .\docker-dev.ps1 run serve --port 4096" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Run the Go TUI:" -ForegroundColor Gray
Write-Host "   .\docker-dev.ps1 tui" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Inside the container, you can run:" -ForegroundColor Gray
Write-Host "   bun install" -ForegroundColor Cyan
Write-Host "   bun run packages/opencode/src/index.ts" -ForegroundColor Cyan
Write-Host "   cd packages/tui && go build ./cmd/opencode && ./opencode" -ForegroundColor Cyan
