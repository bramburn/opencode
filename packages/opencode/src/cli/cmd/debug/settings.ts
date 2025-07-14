import { cmd } from "../cmd"
import { Config } from "../../../config/config"
import { bootstrap } from "../../bootstrap"

export const SettingsCommand = cmd({
  command: "debug-settings",
  describe: "Display the current opencode.json settings",
  async handler() {
    await bootstrap({ cwd: process.cwd() }, async () => {
      try {
        const config = await Config.get()
        // Redact sensitive fields before displaying
        const safeConfig = JSON.parse(JSON.stringify(config))
        if (safeConfig.provider) {
          for (const p in safeConfig.provider) {
            if (safeConfig.provider[p].options?.apiKey) {
              safeConfig.provider[p].options.apiKey = "[REDACTED]"
            }
          }
        }
        const prettyConfig = JSON.stringify(safeConfig, null, 2)
        console.log(`Current opencode.json settings:\n${prettyConfig}`)
      } catch (error) {
        console.log("Could not load opencode.json. Using default settings.")
      }
    })
  },
})
