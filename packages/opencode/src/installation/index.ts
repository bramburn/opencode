import path from "path"
import { z } from "zod"
import { NamedError } from "../util/error"
import { Bus } from "../bus"
import { Log } from "../util/log"
import { execa } from "execa"

declare global {
  const OPENCODE_VERSION: string
}

// Simple shell helper to replace bun's $ template literal
async function shell(command: string, options: { env?: Record<string, string>; throws?: boolean } = {}) {
  const { throws = true, env } = options
  try {
    const result = await execa('bash', ['-c', command], {
      env: { ...process.env, ...env },
      stdio: 'pipe'
    })
    return {
      text: () => result.stdout,
      throws: (shouldThrow: boolean) => ({ text: () => shouldThrow ? result.stdout : result.stdout }),
      env: (envVars: Record<string, string>) => shell(command, { ...options, env: { ...env, ...envVars } })
    }
  } catch (error) {
    if (throws) throw error
    return {
      text: () => '',
      throws: (shouldThrow: boolean) => ({ text: () => '' }),
      env: (envVars: Record<string, string>) => shell(command, { ...options, env: { ...env, ...envVars } })
    }
  }
}

export namespace Installation {
  const log = Log.create({ service: "installation" })

  export type Method = Awaited<ReturnType<typeof method>>

  export const Event = {
    Updated: Bus.event(
      "installation.updated",
      z.object({
        version: z.string(),
      }),
    ),
  }

  export const Info = z
    .object({
      version: z.string(),
      latest: z.string(),
    })
    .openapi({
      ref: "InstallationInfo",
    })
  export type Info = z.infer<typeof Info>

  export async function info() {
    return {
      version: VERSION,
      latest: await latest(),
    }
  }

  export function isSnapshot() {
    return VERSION.startsWith("0.0.0")
  }

  export function isDev() {
    return VERSION === "dev"
  }

  export async function method() {
    if (process.execPath.includes(path.join(".opencode", "bin"))) return "curl"
    const exec = process.execPath.toLowerCase()

    const checks = [
      {
        name: "npm" as const,
        command: async () => (await shell('npm list -g --depth=0', { throws: false })).text(),
      },
      {
        name: "yarn" as const,
        command: async () => (await shell('yarn global list', { throws: false })).text(),
      },
      {
        name: "pnpm" as const,
        command: async () => (await shell('pnpm list -g --depth=0', { throws: false })).text(),
      },
      {
        name: "bun" as const,
        command: async () => (await shell('bun pm ls -g', { throws: false })).text(),
      },
      {
        name: "brew" as const,
        command: async () => (await shell('brew list --formula opencode-ai', { throws: false })).text(),
      },
    ]

    checks.sort((a, b) => {
      const aMatches = exec.includes(a.name)
      const bMatches = exec.includes(b.name)
      if (aMatches && !bMatches) return -1
      if (!aMatches && bMatches) return 1
      return 0
    })

    for (const check of checks) {
      const output = await check.command()
      if (output.includes("opencode-ai")) {
        return check.name
      }
    }

    return "unknown"
  }

  export const UpgradeFailedError = NamedError.create(
    "UpgradeFailedError",
    z.object({
      stderr: z.string(),
    }),
  )

  export async function upgrade(method: Method, target: string) {
    const cmd = (async () => {
      switch (method) {
        case "curl":
          return await shell(`curl -fsSL https://opencode.ai/install | bash`, {
            env: {
              ...process.env,
              VERSION: target,
            }
          })
        case "npm":
          return await shell(`npm install -g opencode-ai@${target}`)
        case "pnpm":
          return await shell(`pnpm install -g opencode-ai@${target}`)
        case "bun":
          return await shell(`bun install -g opencode-ai@${target}`)
        case "brew":
          return await shell(`brew install sst/tap/opencode`, {
            env: {
              HOMEBREW_NO_AUTO_UPDATE: "1",
            }
          })
        default:
          throw new Error(`Unknown method: ${method}`)
      }
    })()
    const result = await cmd.quiet().throws(false)
    log.info("upgraded", {
      method,
      target,
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
    })
    if (result.exitCode !== 0)
      throw new UpgradeFailedError({
        stderr: result.stderr.toString("utf8"),
      })
  }

  export const VERSION = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : "dev"

  export async function latest() {
    return fetch("https://api.github.com/repos/sst/opencode/releases/latest")
      .then((res) => res.json())
      .then((data) => data.tag_name.slice(1) as string)
  }
}
