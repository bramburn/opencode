import { z } from "zod"
import { Global } from "../global"
import { Log } from "../util/log"
import path from "path"
import { NamedError } from "../util/error"
import { nodeSpawn, readableStreamToText } from "../util/node-process"
import { nodeWhich } from "../util/node-process"

export namespace NodeProc {
  const log = Log.create({ service: "node" })

  export async function run(cmd: string[], options?: {
    cwd?: string;
    env?: Record<string, string>;
    signal?: AbortSignal;
    timeout?: number;
  }) {
    log.info("running", {
      cmd: [which(), ...cmd],
      ...options,
    })
    const result = nodeSpawn([which(), ...cmd], {
      ...options,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        ...options?.env,
      },
    })
    const code = await result.exited
    const stdout = result.stdout
      ? await readableStreamToText(result.stdout)
      : undefined
    const stderr = result.stderr
      ? await readableStreamToText(result.stderr)
      : undefined
    log.info("done", {
      code,
      stdout,
      stderr,
    })
    if (code !== 0) {
      throw new Error(`Command failed with exit code ${code}`)
    }
    return {
      exitCode: code,
      stdout,
      stderr,
    }
  }

  export function which() {
    return process.execPath
  }

  export const InstallFailedError = NamedError.create(
    "NodeInstallFailedError",
    z.object({
      pkg: z.string(),
      version: z.string(),
    }),
  )

  export async function install(pkg: string, version = "latest") {
    const { nodeFile, nodeWrite } = await import("../util/node-fs")
    const mod = path.join(Global.Path.cache, "node_modules", pkg)
    const pkgjsonPath = path.join(Global.Path.cache, "package.json")
    const pkgjson = nodeFile(pkgjsonPath)
    const parsed = await pkgjson.json().catch(async () => {
      const result = { dependencies: {} }
      await nodeWrite(pkgjsonPath, JSON.stringify(result, null, 2))
      return result
    })
    if (parsed.dependencies[pkg] === version) return mod

    // Use npm instead of bun for package installation
    const npmPath = await nodeWhich("npm")
    if (!npmPath) {
      throw new Error("npm not found in PATH")
    }

    await nodeSpawn([npmPath, "install", "--save-exact", "--registry=https://registry.npmjs.org", `${pkg}@${version}`], {
      cwd: Global.Path.cache,
    }).exited.catch((e) => {
      throw new InstallFailedError(
        { pkg, version },
        {
          cause: e,
        },
      )
    })
    parsed.dependencies[pkg] = version
    await nodeWrite(pkgjsonPath, JSON.stringify(parsed, null, 2))
    return mod
  }
}

// Export as BunProc for backward compatibility
export const BunProc = NodeProc
