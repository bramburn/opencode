# OpenCode Docker Development Helper Script for PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Arguments = @()
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Function to build the development container
function Build-Container {
    Write-Status "Building OpenCode development container..."
    docker-compose build opencode-dev
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Container built successfully!"
    } else {
        Write-Error "Failed to build container"
        exit 1
    }
}

# Function to start the development environment
function Start-Dev {
    Write-Status "Starting OpenCode development environment..."
    docker-compose up -d opencode-dev
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Development environment started!"
        Write-Status "You can now connect to the container with: .\docker-dev.ps1 shell"
    } else {
        Write-Error "Failed to start development environment"
        exit 1
    }
}

# Function to stop the development environment
function Stop-Dev {
    Write-Status "Stopping OpenCode development environment..."
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Development environment stopped!"
    }
}

# Function to open a shell in the container
function Open-Shell {
    Write-Status "Opening shell in OpenCode development container..."
    docker-compose exec opencode-dev /bin/bash
}

# Function to run bun install
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    docker-compose exec opencode-dev bun install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed!"
    }
}

# Function to run the main application
function Run-App {
    param([string[]]$Args)
    Write-Status "Running OpenCode application..."
    if ($Args.Count -gt 0) {
        docker-compose exec opencode-dev bun run packages/opencode/src/index.ts @Args
    } else {
        docker-compose exec opencode-dev bun run packages/opencode/src/index.ts
    }
}

# Function to build and run Go TUI
function Run-Tui {
    Write-Status "Building and running Go TUI..."
    docker-compose exec opencode-dev bash -c "cd packages/tui && go build ./cmd/opencode && ./opencode"
}

# Function to show logs
function Show-Logs {
    docker-compose logs -f opencode-dev
}

# Function to clean up everything
function Remove-All {
    Write-Warning "This will remove all containers, volumes, and images related to OpenCode development."
    $response = Read-Host "Are you sure? (y/N)"
    if ($response -match "^[Yy]$") {
        Write-Status "Cleaning up..."
        docker-compose down -v --rmi all
        Write-Success "Cleanup completed!"
    } else {
        Write-Status "Cleanup cancelled."
    }
}

# Function to show help
function Show-Help {
    Write-Host "OpenCode Docker Development Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-dev.ps1 [COMMAND] [ARGUMENTS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  build       Build the development container" -ForegroundColor Gray
    Write-Host "  start       Start the development environment" -ForegroundColor Gray
    Write-Host "  stop        Stop the development environment" -ForegroundColor Gray
    Write-Host "  shell       Open a shell in the development container" -ForegroundColor Gray
    Write-Host "  install     Install dependencies (bun install)" -ForegroundColor Gray
    Write-Host "  run [args]  Run the OpenCode application with optional arguments" -ForegroundColor Gray
    Write-Host "  tui         Build and run the Go TUI application" -ForegroundColor Gray
    Write-Host "  logs        Show container logs" -ForegroundColor Gray
    Write-Host "  cleanup     Remove all containers, volumes, and images" -ForegroundColor Gray
    Write-Host "  help        Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\docker-dev.ps1 build                    # Build the container" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 start                    # Start the environment" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 shell                    # Open interactive shell" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 install                  # Install dependencies" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 run                      # Run opencode" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 run serve --port 4096    # Run opencode serve command" -ForegroundColor Gray
    Write-Host "  .\docker-dev.ps1 tui                      # Run the TUI application" -ForegroundColor Gray
}

# Main script logic
Test-Docker

switch ($Command.ToLower()) {
    "build" {
        Build-Container
    }
    "start" {
        Start-Dev
    }
    "stop" {
        Stop-Dev
    }
    "shell" {
        Open-Shell
    }
    "install" {
        Install-Dependencies
    }
    "run" {
        Run-App -Args $Arguments
    }
    "tui" {
        Run-Tui
    }
    "logs" {
        Show-Logs
    }
    "cleanup" {
        Remove-All
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
