import { App } from "../app/app"
import path from "path"
import fs from "fs/promises"
import { Ripgrep } from "../file/ripgrep"
import { Log } from "../util/log"
import { execa } from "execa"

export namespace Snapshot {
  const log = Log.create({ service: "snapshot" })

  export async function create(sessionID: string) {
    return
    log.info("creating snapshot")
    const app = App.info()
    const git = gitdir(sessionID)

    // not a git repo, check if too big to snapshot
    if (!app.git) {
      const files = await Ripgrep.files({
        cwd: app.path.cwd,
        limit: 1000,
      })
      log.info("found files", { count: files.length })
      if (files.length > 1000) return
    }

    if (await fs.mkdir(git, { recursive: true })) {
      await execa('git', ['init'], {
        env: {
          ...process.env,
          GIT_DIR: git,
          GIT_WORK_TREE: app.path.root,
        },
        stdio: 'pipe',
        reject: false
      })
      log.info("initialized")
    }

    await execa('git', ['--git-dir', git, 'add', '.'], {
      cwd: app.path.cwd,
      stdio: 'pipe',
      reject: false
    })
    log.info("added files")

    const result = await execa('git', [
      '--git-dir', git,
      'commit',
      '--allow-empty',
      '-m', 'snapshot',
      '--author=opencode <mail@opencode.ai>'
    ], {
      cwd: app.path.cwd,
      stdio: 'pipe',
      reject: false
    })
    log.info("commit")

    const match = result.stdout.toString().match(/\[.+ ([a-f0-9]+)\]/)
    if (!match) return
    return match![1]
  }

  export async function restore(sessionID: string, commit: string) {
    log.info("restore", { commit })
    const app = App.info()
    const git = gitdir(sessionID)
    await execa('git', ['--git-dir=' + git, 'checkout', commit, '--force'], {
      cwd: app.path.root,
      stdio: 'pipe'
    })
  }

  function gitdir(sessionID: string) {
    const app = App.info()
    return path.join(app.path.data, "snapshot", sessionID)
  }
}
