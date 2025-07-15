import path from "path"
import { Global } from "../global"
import fs from "fs/promises"
import { z } from "zod"
import { nodeFile, nodeWrite, fileExists } from "../util/node-fs"

export namespace Auth {
  export const Oauth = z.object({
    type: z.literal("oauth"),
    refresh: z.string(),
    access: z.string(),
    expires: z.number(),
  })

  export const Api = z.object({
    type: z.literal("api"),
    key: z.string(),
  })

  export const Info = z.discriminatedUnion("type", [Oauth, Api])
  export type Info = z.infer<typeof Info>

  const filepath = path.join(Global.Path.data, "auth.json")

  export async function get(providerID: string) {
    const file = nodeFile(filepath)
    return file
      .json()
      .catch(() => ({}))
      .then((x) => x[providerID] as Info | undefined)
  }

  export async function all(): Promise<Record<string, Info>> {
    const file = nodeFile(filepath)
    return file.json().catch(() => ({}))
  }

  export async function set(key: string, info: Info) {
    const data = await all()
    await nodeWrite(filepath, JSON.stringify({ ...data, [key]: info }, null, 2))
    await fs.chmod(filepath, 0o600)
  }

  export async function remove(key: string) {
    const data = await all()
    delete data[key]
    await nodeWrite(filepath, JSON.stringify(data, null, 2))
    await fs.chmod(filepath, 0o600)
  }
}
