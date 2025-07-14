import { bootstrap } from "../../bootstrap"
import { cmd } from "../cmd"
import { FileCommand } from "./file"
import { LSPCommand } from "./lsp"
import { RipgrepCommand } from "./ripgrep"
import { ScrapCommand } from "./scrap"
import { SnapshotCommand } from "./snapshot"
import { SettingsCommand } from "./settings"

/**
 * DebugCommand is the root command for various debug utilities.
 * It provides subcommands for LSP, ripgrep, file operations, scrap data,
 * snapshots, settings, and a wait command that blocks for 24 hours.
 * Requires at least one subcommand to be specified.
 */

export const DebugCommand = cmd({
  command: "debug",
  builder: (yargs) =>
    yargs
      .command(LSPCommand)
      .command(RipgrepCommand)
      .command(FileCommand)
      .command(ScrapCommand)
      .command(SnapshotCommand)
      .command(SettingsCommand)
      .command({
        command: "wait",
        async handler() {
          await bootstrap({ cwd: process.cwd() }, async () => {
            await new Promise((resolve) => setTimeout(resolve, 1_000 * 60 * 60 * 24))
          })
        },
      })
      .demandCommand(),
  async handler() {},
})
