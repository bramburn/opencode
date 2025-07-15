#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);

async function installHooks() {
  // Check if .git directory exists
  const gitDir = path.join(rootDir, '.git');
  try {
    await fs.access(gitDir);
  } catch {
    // Not a git repository, exit silently
    process.exit(0);
  }

  // Create hooks directory
  const hooksDir = path.join(gitDir, 'hooks');
  await fs.mkdir(hooksDir, { recursive: true });

  // Create pre-push hook content
  const prePushHook = `#!/bin/sh
pnpm run typecheck
`;

  // Write pre-push hook
  const prePushPath = path.join(hooksDir, 'pre-push');
  await fs.writeFile(prePushPath, prePushHook, 'utf-8');
  
  // Make it executable (Unix/Linux/macOS)
  if (process.platform !== 'win32') {
    await fs.chmod(prePushPath, 0o755);
  }

  console.log('✅ Pre-push hook installed');
}

installHooks().catch(console.error);
