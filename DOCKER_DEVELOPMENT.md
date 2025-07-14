# OpenCode Docker Development Environment

This document describes how to set up and use the Docker development environment for OpenCode, which includes both Bun (TypeScript) and Go development tools.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)
- WSL2 (if on Windows) for optimal performance

## Quick Start

### For Windows PowerShell (Recommended for WSL):

```powershell
# Test the setup (optional but recommended)
.\test-docker-setup.ps1

# Build the development container
.\docker-dev.ps1 build

# Start the development environment
.\docker-dev.ps1 start

# Open an interactive shell
.\docker-dev.ps1 shell
```

### For Linux/macOS/WSL:

```bash
# Build the development container
./docker-dev.sh build

# Start the development environment
./docker-dev.sh start

# Open an interactive shell
./docker-dev.sh shell
```

### Quick Test

Run the test script to verify everything is working:
```powershell
.\test-docker-setup.ps1
```

## What's Included

The Docker development environment includes:

- **Ubuntu 22.04** base image
- **Bun 1.2.14** - JavaScript/TypeScript runtime and package manager
- **Go 1.24.0** - Go programming language
- **Development tools**: git, vim, nano, htop, tree, jq
- **Build tools**: build-essential, curl, wget

## Container Structure

```
/app/                           # Project root (mounted from host)
├── packages/
│   ├── opencode/              # Main TypeScript application
│   │   └── src/index.ts       # Main entry point
│   └── tui/                   # Go TUI application
│       └── cmd/opencode/      # Go main package
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile.dev             # Development Dockerfile
├── docker-dev.sh             # Linux/macOS helper script
└── docker-dev.ps1            # Windows PowerShell helper script
```

## Available Commands

### Using Helper Scripts

#### Linux/macOS/WSL (`./docker-dev.sh`):
- `build` - Build the development container
- `start` - Start the development environment
- `stop` - Stop the development environment
- `shell` - Open an interactive shell in the container
- `install` - Install dependencies (`bun install`)
- `run [args]` - Run the OpenCode application
- `tui` - Build and run the Go TUI application
- `logs` - Show container logs
- `cleanup` - Remove all containers, volumes, and images

#### Windows PowerShell (`.\docker-dev.ps1`):
Same commands as above, but using PowerShell syntax.

### Direct Docker Commands

If you prefer using Docker directly:

```bash
# Build the container
docker-compose build opencode-dev

# Start the environment
docker-compose up -d opencode-dev

# Open a shell
docker-compose exec opencode-dev /bin/bash

# Stop the environment
docker-compose down
```

## Development Workflow

### 1. Initial Setup

```bash
# Build and start the environment
./docker-dev.sh build
./docker-dev.sh start

# Install dependencies
./docker-dev.sh install
```

### 2. Running the TypeScript Application

```bash
# Open shell in container
./docker-dev.sh shell

# Inside the container:
bun run packages/opencode/src/index.ts

# Or run specific commands:
bun run packages/opencode/src/index.ts serve --port 4096
```

### 3. Working with the Go TUI

```bash
# Build and run the TUI
./docker-dev.sh tui

# Or manually inside the container:
cd packages/tui
go build ./cmd/opencode
./opencode
```

### 4. Development Commands Inside Container

Once you're in the container shell (`./docker-dev.sh shell`):

```bash
# Install dependencies
bun install

# Run the main application
bun run dev
# or
bun run packages/opencode/src/index.ts

# TypeScript type checking
bun run typecheck

# Build Go TUI
cd packages/tui
go build ./cmd/opencode

# Run Go tests
go test ./...

# Install Go dependencies
go mod tidy
```

## Port Mappings

The following ports are exposed from the container:

- `4096:4096` - Default OpenCode serve port
- `3000:3000` - Additional development port
- `8080:8080` - Additional development port

## Volume Mounts

- **Project files**: Your local project directory is mounted to `/app` in the container
- **Node modules**: Excluded to avoid conflicts between host and container
- **Go module cache**: Persistent volume for Go dependencies
- **Bun cache**: Persistent volume for Bun cache

## Troubleshooting

### Container won't start
```bash
# Check Docker is running
docker info

# Check container logs
./docker-dev.sh logs
```

### Permission issues
```bash
# On Linux/WSL, ensure your user can access Docker
sudo usermod -aG docker $USER
# Then log out and back in
```

### Dependencies not installing
```bash
# Clean rebuild
./docker-dev.sh cleanup
./docker-dev.sh build
./docker-dev.sh start
./docker-dev.sh install
```

### Go build issues
```bash
# Inside container, clean Go modules
cd packages/tui
go clean -modcache
go mod download
```

## Customization

### Adding New Dependencies

For TypeScript/JavaScript dependencies:
```bash
# Inside container
bun add <package-name>
```

For Go dependencies:
```bash
# Inside container
cd packages/tui
go get <package-name>
```

### Modifying the Container

Edit `Dockerfile.dev` to add new tools or change the base configuration, then rebuild:

```bash
./docker-dev.sh cleanup
./docker-dev.sh build
```

## Performance Tips

1. **Use WSL2** on Windows for better performance
2. **Exclude node_modules** from antivirus scanning
3. **Use Docker Desktop's** resource limits appropriately
4. **Keep volumes** for caching (don't cleanup unless necessary)

## Security Notes

- The container runs as root for development convenience
- Volumes are mounted with full access to the project directory
- This setup is intended for development only, not production
