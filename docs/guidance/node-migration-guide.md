# OpenCode Node.js Migration Guide

## Overview
This guide provides examples and patterns for migrating from Bun-specific APIs to Node.js equivalents during the OpenCode runtime migration.

## File System Operations

### Reading Files
```typescript
// Before (Bun)
const content = await Bun.file(filepath).text();
const exists = await Bun.file(filepath).exists();
const json = await Bun.file(filepath).json();

// After (Node.js)
import { promises as fs } from 'fs';

const content = await fs.readFile(filepath, 'utf-8');
const exists = await fs.access(filepath).then(() => true).catch(() => false);
const json = JSON.parse(await fs.readFile(filepath, 'utf-8'));
```

### Writing Files
```typescript
// Before (Bun)
await Bun.write(filepath, content);
await Bun.write(filepath, JSON.stringify(data, null, 2));

// After (Node.js)
import { promises as fs } from 'fs';
import path from 'path';

// Ensure directory exists
await fs.mkdir(path.dirname(filepath), { recursive: true });
await fs.writeFile(filepath, content, 'utf-8');
await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
```

## Process Spawning

### Basic Process Execution
```typescript
// Before (Bun)
const proc = Bun.spawn(['git', 'status'], {
  stdout: 'pipe',
  stderr: 'pipe'
});

// After (Node.js with execa)
import { execa } from 'execa';

const proc = execa('git', ['status'], {
  stdio: 'pipe'
});
```

### Cross-platform Process Spawning
```typescript
// Before (Bun)
const proc = Bun.spawn({
  cmd: ['bash', '-c', command],
  cwd: workingDir,
  stdout: 'pipe'
});

// After (Node.js with execa)
import { execa } from 'execa';

const proc = execa('bash', ['-c', command], {
  cwd: workingDir,
  stdio: 'pipe'
});
```

## Environment Variables
```typescript
// Before (Bun)
const apiKey = Bun.env.OPENAI_API_KEY;

// After (Node.js)
const apiKey = process.env.OPENAI_API_KEY;
```

## Path Resolution
```typescript
// Before (Bun)
const resolved = Bun.resolveSync('./relative/path', import.meta.dir);

// After (Node.js)
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolved = path.resolve(__dirname, './relative/path');
```

## Binary Detection
```typescript
// Before (Bun)
const binary = Bun.which('git');

// After (Node.js)
import which from 'which';

const binary = await which('git').catch(() => null);
```

## Glob Patterns
```typescript
// Before (Bun)
const files = new Bun.Glob("**/*.json").scanSync({
  cwd: dir,
  absolute: true
});

// After (Node.js)
import { glob } from 'glob';

const files = await glob("**/*.json", {
  cwd: dir,
  absolute: true
});
```

## Stream Handling
```typescript
// Before (Bun)
import { readableStreamToText } from 'bun';
const text = await readableStreamToText(stream);

// After (Node.js)
import { Readable } from 'stream';

const text = await new Promise<string>((resolve, reject) => {
  let data = '';
  stream.on('data', chunk => data += chunk);
  stream.on('end', () => resolve(data));
  stream.on('error', reject);
});

// Or using modern approach
const text = await new Response(stream).text();
```

## Package Manager Commands

### Root package.json scripts
```json
{
  "scripts": {
    "dev": "pnpm --filter=@opencode/cli dev",
    "build": "pnpm --parallel --filter \"@opencode/*\" build",
    "test": "pnpm --parallel test",
    "typecheck": "pnpm --parallel typecheck"
  }
}
```

### Package-specific scripts
```json
{
  "scripts": {
    "build": "node ./script/build.mjs",
    "dev": "tsx ./src/index.ts",
    "start": "node ./dist/server/index.mjs"
  }
}
```

## Dependencies to Add
- `@types/node` - Node.js type definitions
- `execa` - Cross-platform process execution
- `which` - Binary detection
- `glob` - File pattern matching
- `tsx` - TypeScript execution for Node.js

## Dependencies to Remove
- `@types/bun` - Bun-specific type definitions
