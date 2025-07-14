#!/bin/bash

# OpenCode Docker Development Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the development container
build_container() {
    print_status "Building OpenCode development container..."
    docker-compose build opencode-dev
    print_success "Container built successfully!"
}

# Function to start the development environment
start_dev() {
    print_status "Starting OpenCode development environment..."
    docker-compose up -d opencode-dev
    print_success "Development environment started!"
    print_status "You can now connect to the container with: $0 shell"
}

# Function to stop the development environment
stop_dev() {
    print_status "Stopping OpenCode development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to open a shell in the container
open_shell() {
    print_status "Opening shell in OpenCode development container..."
    docker-compose exec opencode-dev /bin/bash
}

# Function to run bun install
install_deps() {
    print_status "Installing dependencies..."
    docker-compose exec opencode-dev bun install
    print_success "Dependencies installed!"
}

# Function to run the main application
run_app() {
    print_status "Running OpenCode application..."
    docker-compose exec opencode-dev bun run packages/opencode/src/index.ts "$@"
}

# Function to build and run Go TUI
run_tui() {
    print_status "Building and running Go TUI..."
    docker-compose exec opencode-dev bash -c "cd packages/tui && go build ./cmd/opencode && ./opencode"
}

# Function to show logs
show_logs() {
    docker-compose logs -f opencode-dev
}

# Function to clean up everything
cleanup() {
    print_warning "This will remove all containers, volumes, and images related to OpenCode development."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --rmi all
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show help
show_help() {
    echo "OpenCode Docker Development Helper"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build the development container"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  shell       Open a shell in the development container"
    echo "  install     Install dependencies (bun install)"
    echo "  run [args]  Run the OpenCode application with optional arguments"
    echo "  tui         Build and run the Go TUI application"
    echo "  logs        Show container logs"
    echo "  cleanup     Remove all containers, volumes, and images"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build                    # Build the container"
    echo "  $0 start                    # Start the environment"
    echo "  $0 shell                    # Open interactive shell"
    echo "  $0 install                  # Install dependencies"
    echo "  $0 run                      # Run opencode"
    echo "  $0 run serve --port 4096    # Run opencode serve command"
    echo "  $0 tui                      # Run the TUI application"
}

# Main script logic
case "${1:-help}" in
    build)
        check_docker
        build_container
        ;;
    start)
        check_docker
        start_dev
        ;;
    stop)
        check_docker
        stop_dev
        ;;
    shell)
        check_docker
        open_shell
        ;;
    install)
        check_docker
        install_deps
        ;;
    run)
        check_docker
        shift
        run_app "$@"
        ;;
    tui)
        check_docker
        run_tui
        ;;
    logs)
        check_docker
        show_logs
        ;;
    cleanup)
        check_docker
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
