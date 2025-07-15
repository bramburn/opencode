/**
 * Node.js file system utilities to replace Bun.file() and Bun.write() APIs
 */
import { promises as fs } from 'fs';
import path from 'path';

export class NodeFile {
  constructor(private filepath: string) {}

  async text(): Promise<string> {
    try {
      return await fs.readFile(this.filepath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  async json<T = any>(): Promise<T> {
    const content = await this.text();
    if (!content.trim()) {
      throw new Error(`File ${this.filepath} is empty or does not exist`);
    }
    return JSON.parse(content);
  }

  async bytes(): Promise<Buffer> {
    try {
      return await fs.readFile(this.filepath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return Buffer.alloc(0);
      }
      throw error;
    }
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filepath);
      return true;
    } catch {
      return false;
    }
  }

  get name(): string {
    return this.filepath;
  }
}

/**
 * Create a file handle similar to Bun.file()
 */
export function nodeFile(filepath: string): NodeFile {
  return new NodeFile(filepath);
}

/**
 * Write content to a file, similar to Bun.write()
 */
export async function nodeWrite(filepath: string, content: string | Buffer | ArrayBuffer): Promise<void> {
  // Ensure directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  
  if (typeof content === 'string') {
    await fs.writeFile(filepath, content, 'utf-8');
  } else if (content instanceof Buffer) {
    await fs.writeFile(filepath, content);
  } else if (content instanceof ArrayBuffer) {
    await fs.writeFile(filepath, Buffer.from(content));
  } else {
    throw new Error('Unsupported content type');
  }
}

/**
 * Read a file as text
 */
export async function readFileText(filepath: string): Promise<string> {
  return nodeFile(filepath).text();
}

/**
 * Read a file as JSON
 */
export async function readFileJson<T = any>(filepath: string): Promise<T> {
  return nodeFile(filepath).json<T>();
}

/**
 * Check if a file exists
 */
export async function fileExists(filepath: string): Promise<boolean> {
  return nodeFile(filepath).exists();
}
