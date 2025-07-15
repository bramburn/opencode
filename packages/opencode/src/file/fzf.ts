import path from "path"
import { Global } from "../global"
import fs from "fs/promises"
import { z } from "zod"
import { NamedError } from "../util/error"
import { lazy } from "../util/lazy"
import { Log } from "../util/log"
import { nodeFile, nodeWrite, fileExists } from "../util/node-fs"
import { nodeSpawn, readableStreamToText } from "../util/node-process"

export namespace Fzf {
  const log = Log.create({ service: "fzf" })

  const VERSION = "0.62.0"
  const PLATFORM = {
    darwin: { extension: "tar.gz" },
    linux: { extension: "tar.gz" },
    win32: { extension: "zip" },
  } as const

  export const ExtractionFailedError = NamedError.create(
    "FzfExtractionFailedError",
    z.object({
      filepath: z.string(),
      stderr: z.string(),
    }),
  )

  export const UnsupportedPlatformError = NamedError.create(
    "FzfUnsupportedPlatformError",
    z.object({
      platform: z.string(),
    }),
  )

  export const DownloadFailedError = NamedError.create(
    "FzfDownloadFailedError",
    z.object({
      url: z.string(),
      status: z.number(),
    }),
  )

  const state = lazy(async () => {
    let filepath = Bun.which("fzf")
    if (filepath) {
      log.info("found", { filepath })
      return { filepath }
    }
    filepath = path.join(Global.Path.bin, "fzf" + (process.platform === "win32" ? ".exe" : ""))

    if (!(await fileExists(filepath))) {
      const archMap = { x64: "amd64", arm64: "arm64" } as const
      const arch = archMap[process.arch as keyof typeof archMap] ?? "amd64"

      const config = PLATFORM[process.platform as keyof typeof PLATFORM]
      if (!config) throw new UnsupportedPlatformError({ platform: process.platform })

      const version = VERSION
      const platformName = process.platform === "win32" ? "windows" : process.platform
      const filename = `fzf-${version}-${platformName}_${arch}.${config.extension}`
      const url = `https://github.com/junegunn/fzf/releases/download/v${version}/${filename}`

      const response = await fetch(url)
      if (!response.ok) throw new DownloadFailedError({ url, status: response.status })

      const buffer = await response.arrayBuffer()
      const archivePath = path.join(Global.Path.bin, filename)
      await nodeWrite(archivePath, Buffer.from(buffer))
      if (config.extension === "tar.gz") {
        const proc = nodeSpawn(["tar", "-xzf", archivePath, "fzf"], {
          cwd: Global.Path.bin,
          stderr: "pipe",
          stdout: "pipe",
        })
        const exitCode = await proc.exited
        if (exitCode !== 0)
          throw new ExtractionFailedError({
            filepath,
            stderr: proc.stderr ? await readableStreamToText(proc.stderr) : "",
          })
      }
      if (config.extension === "zip") {
        const proc = nodeSpawn(["unzip", "-j", archivePath, "fzf.exe", "-d", Global.Path.bin], {
          cwd: Global.Path.bin,
          stderr: "pipe",
          stdout: "ignore",
        })
        const exitCode = await proc.exited
        if (exitCode !== 0)
          throw new ExtractionFailedError({
            filepath: archivePath,
            stderr: proc.stderr ? await readableStreamToText(proc.stderr) : "",
          })
      }
      await fs.unlink(archivePath)
      if (process.platform !== "win32") await fs.chmod(filepath, 0o755)
    }

    return {
      filepath,
    }
  })

  export async function filepath() {
    const { filepath } = await state()
    return filepath
  }
}
