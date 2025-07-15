/**
 * Node.js process utilities to replace Bun.spawn() and related APIs
 */
import { execa, type ExecaChildProcess, type Options as ExecaOptions } from 'execa';
import which from 'which';

export interface SpawnOptions {
  cmd?: string[];
  cwd?: string;
  env?: Record<string, string>;
  stdout?: 'pipe' | 'inherit' | 'ignore';
  stderr?: 'pipe' | 'inherit' | 'ignore';
  stdin?: 'pipe' | 'inherit' | 'ignore';
  signal?: AbortSignal;
  timeout?: number;
  maxBuffer?: number;
  onExit?: () => void;
}

export interface SpawnResult {
  exited: Promise<number>;
  exitCode: number | null;
  stdout: ReadableStream | number | null;
  stderr: ReadableStream | number | null;
}

/**
 * Spawn a process similar to Bun.spawn()
 */
export function nodeSpawn(cmdOrOptions: string[] | SpawnOptions, options?: SpawnOptions): SpawnResult {
  let cmd: string[];
  let opts: SpawnOptions;

  if (Array.isArray(cmdOrOptions)) {
    cmd = cmdOrOptions;
    opts = options || {};
  } else {
    cmd = cmdOrOptions.cmd || [];
    opts = cmdOrOptions;
  }

  if (cmd.length === 0) {
    throw new Error('Command array cannot be empty');
  }

  const [command, ...args] = cmd;
  
  const execaOptions: ExecaOptions = {
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
    signal: opts.signal,
    timeout: opts.timeout,
    maxBuffer: opts.maxBuffer,
    stdio: [
      opts.stdin || 'pipe',
      opts.stdout || 'pipe', 
      opts.stderr || 'pipe'
    ],
  };

  const childProcess = execa(command, args, execaOptions);

  // Handle onExit callback
  if (opts.onExit) {
    childProcess.then(opts.onExit, opts.onExit);
  }

  return {
    exited: childProcess.then(result => result.exitCode || 0, error => error.exitCode || 1),
    exitCode: null, // Will be set when process exits
    stdout: childProcess.stdout ? new ReadableStream({
      start(controller) {
        childProcess.stdout?.on('data', chunk => controller.enqueue(chunk));
        childProcess.stdout?.on('end', () => controller.close());
        childProcess.stdout?.on('error', err => controller.error(err));
      }
    }) : null,
    stderr: childProcess.stderr ? new ReadableStream({
      start(controller) {
        childProcess.stderr?.on('data', chunk => controller.enqueue(chunk));
        childProcess.stderr?.on('end', () => controller.close());
        childProcess.stderr?.on('error', err => controller.error(err));
      }
    }) : null,
  };
}

/**
 * Find binary path similar to Bun.which()
 */
export async function nodeWhich(binary: string, options?: { PATH?: string }): Promise<string | null> {
  try {
    const env = options?.PATH ? { PATH: options.PATH } : undefined;
    return await which(binary, { path: env?.PATH });
  } catch {
    return null;
  }
}

/**
 * Synchronous version of nodeWhich for compatibility
 */
export function nodeWhichSync(binary: string, options?: { PATH?: string }): string | null {
  try {
    const env = options?.PATH ? { PATH: options.PATH } : undefined;
    return which.sync(binary, { path: env?.PATH, nothrow: true });
  } catch {
    return null;
  }
}

/**
 * Convert ReadableStream to text (replacement for readableStreamToText from bun)
 */
export async function readableStreamToText(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode(); // Flush any remaining bytes
    return result;
  } finally {
    reader.releaseLock();
  }
}
