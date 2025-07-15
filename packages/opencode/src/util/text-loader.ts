/**
 * Utility to load text files at runtime for Node.js compatibility
 * Replaces direct .txt imports that work in Bun but not in Node.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Load a text file relative to the calling module
 * @param relativePath - Path relative to the calling file
 * @param importMetaUrl - import.meta.url from the calling module
 */
export function loadText(relativePath: string, importMetaUrl: string): string {
  const currentDir = path.dirname(fileURLToPath(importMetaUrl));
  const fullPath = path.resolve(currentDir, relativePath);
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Load a text file with an absolute path
 */
export function loadTextAbsolute(absolutePath: string): string {
  return readFileSync(absolutePath, 'utf-8');
}
