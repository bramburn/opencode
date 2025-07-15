/**
 * Node.js glob utilities to replace Bun.Glob APIs
 */
import { glob as nodeGlob } from 'glob';

export interface GlobOptions {
  cwd?: string;
  absolute?: boolean;
  dot?: boolean;
  ignore?: string[];
}

export class NodeGlob {
  constructor(private pattern: string) {}

  /**
   * Scan for files synchronously (similar to Bun.Glob.scanSync)
   */
  scanSync(options: GlobOptions = {}): string[] {
    return nodeGlob.sync(this.pattern, {
      cwd: options.cwd,
      absolute: options.absolute,
      dot: options.dot,
      ignore: options.ignore,
    });
  }

  /**
   * Scan for files asynchronously (similar to Bun.Glob.scan)
   */
  async scan(options: GlobOptions = {}): Promise<string[]> {
    return nodeGlob(this.pattern, {
      cwd: options.cwd,
      absolute: options.absolute,
      dot: options.dot,
      ignore: options.ignore,
    });
  }

  /**
   * Async iterator for files (similar to Bun.Glob.scan with for await)
   */
  async *scanAsync(options: GlobOptions = {}): AsyncIterableIterator<string> {
    const files = await this.scan(options);
    for (const file of files) {
      yield file;
    }
  }

  /**
   * Check if a string matches the pattern
   */
  match(input: string): boolean {
    // Use minimatch for pattern matching
    const minimatch = require('minimatch');
    return minimatch(input, this.pattern);
  }
}

/**
 * Create a glob instance similar to new Bun.Glob()
 */
export function createGlob(pattern: string): NodeGlob {
  return new NodeGlob(pattern);
}

/**
 * Direct glob function for simple cases
 */
export async function globFiles(pattern: string, options: GlobOptions = {}): Promise<string[]> {
  return nodeGlob(pattern, {
    cwd: options.cwd,
    absolute: options.absolute,
    dot: options.dot,
    ignore: options.ignore,
  });
}

/**
 * Synchronous glob function
 */
export function globFilesSync(pattern: string, options: GlobOptions = {}): string[] {
  return nodeGlob.sync(pattern, {
    cwd: options.cwd,
    absolute: options.absolute,
    dot: options.dot,
    ignore: options.ignore,
  });
}
