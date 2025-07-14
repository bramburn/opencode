import { cmd } from "../cmd"
import { Config } from "../../../config/config"
import { bootstrap } from "../../bootstrap"
import cloneDeep from "lodash/cloneDeep"
/**
 * Command to display the current opencode.json settings with sensitive fields redacted.
 *
 * @remarks
 * - Automatically redacts API keys in provider configurations before display.
 * - Shows formatted JSON output for readability.
 * - Falls back to default settings message if config cannot be loaded.
 */
export const SettingsCommand = cmd({
  command: "debug-settings",
  describe: "Display the current opencode.json settings",
  async handler() {
    await bootstrap({ cwd: process.cwd() }, async () => {
      try {
        const config = await Config.get()
        // Redact sensitive fields before displaying
        const safeConfig = cloneDeep(config) // lodash
        if (safeConfig.provider) {
          for (const p in safeConfig.provider) {
            if (safeConfig.provider[p].options?.['apiKey']) {
              safeConfig.provider[p].options['apiKey'] = "[REDACTED]"
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
