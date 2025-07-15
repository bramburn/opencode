# OpenCode

OpenCode is an AI-powered coding assistant that runs in your terminal.

## Prerequisites

- Node.js 18+ (recommended: use the version specified in `.nvmrc`)
- pnpm (recommended package manager)

## Installation

To install dependencies:

```bash
pnpm install
```

## Development

To run the development version:

```bash
pnpm dev --help
```

To start the TUI (Terminal User Interface):

```bash
pnpm dev
```

To run with a specific message:

```bash
pnpm dev run "your message here"
```

To list available models:

```bash
pnpm dev models
```

To manage authentication:

```bash
pnpm dev auth
```

## Available Commands

- `pnpm dev` - Start the interactive TUI
- `pnpm dev run [message]` - Run with a specific message
- `pnpm dev auth` - Manage authentication credentials
- `pnpm dev models` - List all available AI models
- `pnpm dev serve` - Start a headless server
- `pnpm dev upgrade` - Upgrade to the latest version

## Project Structure

This project has been migrated from Bun to Node.js for better compatibility and ecosystem support. It uses:

- **Node.js** as the runtime
- **TypeScript** for type safety
- **tsx** for TypeScript execution
- **pnpm** for package management
- **Vite** for web development (in the web package)
