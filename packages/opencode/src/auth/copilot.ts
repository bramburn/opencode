import { Global } from "../global"
import { lazy } from "../util/lazy"
import path from "path"
import { nodeFile, nodeWrite, fileExists } from "../util/node-fs"

export const AuthCopilot = lazy(async () => {
  const filePath = path.join(Global.Path.state, "plugin", "copilot.ts")
  const response = fetch("https://raw.githubusercontent.com/sst/opencode-github-copilot/refs/heads/main/auth.ts")
    .then(async (x) => {
      const buffer = await x.arrayBuffer()
      await nodeWrite(filePath, Buffer.from(buffer))
    })
    .catch(() => {})

  if (!(await fileExists(filePath))) {
    const worked = await response
    if (!worked) return
  }
  const result = await import(filePath).catch(() => {})
  if (!result) return
  return result.AuthCopilot
})
