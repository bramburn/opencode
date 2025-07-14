# 1\. Title & Overview

**Project Name:** OpenCode Runtime Environment Migration

**One-sentence summary:** This project will migrate the OpenCode application from the Bun runtime to a standard Node.js environment, replacing the bundler with Vite and the package manager with npm/yarn/pnpm to ensure cross-platform compatibility, particularly for Windows developers.

# 2\. Goals & Success Metrics

- **Business Objectives**
    
    - Increase the potential user base by ensuring the application can be developed and run on Windows.
        
    - Reduce developer onboarding friction by using industry-standard tools like Node.js and npm/yarn/pnpm.
        
    - Improve long-term maintainability by moving away from a less-common runtime environment.
        
    - Standardize the development and CI/CD environments across all operating systems.
        
- **User Success Metrics**
    
    - A developer can successfully clone, install dependencies, and run the application on Windows, macOS, and Linux.
        
    - The time to a successful first build for a new developer is reduced by 25%.
        
    - 100% of existing tests pass in the new Node.js environment.
        
    - The `opencode` TUI and CLI function identically to the previous Bun-based version.
        
    - CI/CD pipeline successfully builds and deploys the application using the new stack.
        

# 3\. User Personas

- **Alex (Windows Developer):** A backend developer who primarily works on a Windows machine. Alex has been unable to contribute to the project due to the lack of Windows support for Bun.
    
- **Sam (macOS/Linux Developer):** An existing developer on the team who is comfortable with the current Bun setup but understands the need for broader compatibility. Sam wants the transition to be as smooth as possible with minimal disruption to their workflow.
    

# 4\. Requirements Breakdown

| 
Phase

 | 

Sprint

 | 

User Story

 | 

Acceptance Criteria

 | 

Duration

 |
| --- | --- | --- | --- | --- |
| 

**Phase 1: Core Migration**

 | 

**Sprint 1: Environment Foundation**

 | 

As a developer, I want to establish the basic Node.js environment and replace Bun's package management so that I can install dependencies using a standard tool.

 | 

1\. `bunfig.toml` is removed.<br>2. An `.nvmrc` file is added to specify the target Node.js version.<br>3. All `bun ...` commands in `package.json` scripts are replaced with `npm ...` (or equivalent).<br>4. All project dependencies are successfully installed using the chosen package manager.

 | 

1 week

 |
| 

  


 | 

**Sprint 2: Vite Integration**

 | 

As a developer, I want to integrate Vite as the build tool for the frontend so that I can bundle the web application without relying on Bun.

 | 

1\. Vite and its necessary plugins are added as dev dependencies.<br>2. A `vite.config.ts` file is created in `packages/web`.<br>3. The Astro configuration (`astro.config.mjs`) is updated to use Vite.<br>4. The frontend application (`packages/web`) can be successfully built and run in development mode using Vite.

 | 

1 week

 |
| 

  


 | 

**Sprint 3: Bun API Removal**

 | 

As a developer, I want to replace Bun-specific file system and process APIs with Node.js equivalents so the code is no longer dependent on the Bun runtime.

 | 

1\. All `Bun.file()`, `Bun.write()`, and `Bun.resolve` calls are replaced with Node.js `fs/promises` and `require.resolve` equivalents.<br>2. All `Bun.spawn()` calls are replaced with `child_process.spawn()` or a cross-platform library.<br>3. All Bun-specific globals and environment variables (e.g., `BUN_BE_BUN`) are removed.<br>4. The application's core logic compiles without Bun-specific type errors.

 | 

1 week

 |
| 

  


 | 

**Sprint 4: Backend Server & TUI Connectivity**

 | 

As a developer, I want the TypeScript backend server to run on Node.js and the Go TUI to connect to it, so that the main application loop is functional.

 | 

1\. The `dev` script for `packages/opencode` is updated to run the server using a Node.js-compatible tool like `tsx`.<br>2. The server starts without errors on Node.js.<br>3. The Go TUI successfully launches and establishes a connection to the Node.js backend server.<br>4. Basic commands sent from the TUI are received and processed by the backend.

 | 

1 week

 |
| 

  


 | 

**Sprint 5: Installation Script Conversion**

 | 

As a Windows developer, I want a cross-platform installation script so that I can install OpenCode easily from the command line.

 | 

1\. The root `install` bash script is rewritten as a cross-platform Node.js script (`install.mjs`).<br>2. The new script correctly detects OS (Windows, macOS, Linux) and architecture (x64, arm64).<br>3. The script successfully downloads and unzips the correct binary from GitHub releases.<br>4. The script correctly places the binary in the user's local bin directory (`~/.opencode/bin`).

 | 

1 week

 |
| 

  


 | 

**Sprint 6: CLI & Internal Scripts**

 | 

As a developer, I want the CLI entry points and internal scripts to be cross-platform so that development and release tasks work on any OS.

 | 

1\. The `packages/opencode/bin/opencode` shell script and `opencode.cmd` batch file are updated to execute via Node.js.<br>2. The `scripts/hooks` and `hooks.bat` files are updated to use `npm` or an equivalent command.<br>3. The `scripts/release` and `scripts/stats.ts` are updated for cross-platform compatibility.<br>4. The `postinstall.mjs` script is confirmed to work with `npm install`.

 | 

1 week

 |
| 

**Phase 2: Integration & Validation**

 | 

**Sprint 7: CI Build & Test Migration**

 | 

As a developer, I want the CI pipeline to use Node.js for building and testing so that I can validate changes in a consistent environment.

 | 

1\. All GitHub Actions workflows are updated to use `setup-node` instead of `setup-bun`.<br>2. All `bun install` and `bun test` steps are replaced with `npm` (or equivalent) commands.<br>3. The `typecheck` job runs successfully across all packages.<br>4. All existing tests pass in the new Node.js CI environment.

 | 

1 week

 |
| 

  


 | 

**Sprint 8: CI Deployment Migration**

 | 

As a developer, I want the CI to be able to publish and deploy the application using the new Node.js stack so that we can release new versions.

 | 

1\. The `publish.yml` workflow successfully builds and publishes all npm packages using the new stack.<br>2. The `deploy.yml` workflow successfully runs `sst deploy` using a Node.js-based command.<br>3. The Cloudflare workers and Astro site are deployed successfully from the CI pipeline.<br>4. The `stats.yml` workflow runs successfully using a Node.js script runner.

 | 

1 week

 |
| 

  


 | 

**Sprint 9: Frontend Package Migration**

 | 

As a frontend developer, I want the `packages/web` to be fully compatible with the new Node.js and Vite build system.

 | 

1\. The `dev` and `build` scripts for `packages/web` run successfully using the new stack.<br>2. All dependencies in `packages/web/package.json` are audited and confirmed to be compatible with Node.js.<br>3. The Astro site is visually and functionally identical to the Bun-based version.

 | 

1 week

 |
| 

  


 | 

**Sprint 10: Backend Function Migration**

 | 

As a backend developer, I want the Cloudflare Function and its related web pages to be fully functional within the new Node.js-based SST setup.

 | 

1\. The `packages/function` dependencies are compatible with Node.js.<br>2. The SST configuration in `infra/app.ts` correctly links and deploys the Cloudflare worker.<br>3. The shared pages (`/s/[id].astro`) correctly fetch data from the backend function.<br>4. Real-time updates via WebSockets on the share page function as expected.

 | 

1 week

 |
| 

  


 | 

**Sprint 11: Cross-Platform QA**

 | 

As a QA engineer, I want to run all automated and manual tests on Windows, macOS, and Linux to ensure there are no platform-specific regressions.

 | 

1\. All unit and integration tests pass on Windows, macOS, and Linux.<br>2. A testing checklist for all CLI commands is executed successfully on each OS.<br>3. The TUI is manually tested for visual and functional regressions on each OS.<br>4. The `test-*.js` files are successfully executed using Node.js on all platforms.

 | 

1 week

 |
| 

  


 | 

**Sprint 12: E2E and Release Validation**

 | 

As a Windows developer, I want to validate the entire end-to-end experience from installation to running the application to ensure a smooth onboarding.

 | 

1\. The new Node.js-based installation script is successfully tested on a clean Windows 11 machine.<br>2. The developer setup (clone, install, run) is documented and verified on Windows.<br>3. A test release is performed using the updated `publish.yml` workflow.<br>4. The generated binaries and npm packages from the test release are successfully installed and run on all three platforms.

 | 

1 week

 |

# 5\. Timeline Summary

- **Phase 1: Core Migration:** 6 weeks
    
- **Phase 2: Integration & Validation:** 6 weeks
    
- **Total:** 12 weeks
    

# 6\. Risks & Assumptions

- **Risk/Dependency 1:** Some Bun-specific APIs may not have direct 1:1 equivalents in Node.js, requiring more complex refactoring.
    
    - **Mitigation:** Allocate extra time in Sprint 3 for research and implementation of alternative solutions. Prioritize the most critical APIs first.
        
- **Risk/Dependency 2:** The Go-based TUI may have implicit dependencies on the Bun runtime's behavior for communication with the backend.
    
    - **Mitigation:** Conduct early testing in Sprint 4 to identify any issues with the TUI-backend interface. The Stainless SDK for Go might need to be regenerated.
        
- **Assumption A:** All existing npm dependencies are compatible with a standard Node.js runtime.
    
    - **Impact if false:** The dependency migration in Sprint 1 could be delayed if packages need to be replaced or updated to versions that support Node.js.
        
- **Assumption B:** The performance of the application under Node.js will be acceptable compared to Bun.
    
    - **Impact if false:** Additional optimization work may be required after the migration, potentially extending the project timeline.
        

# 7\. Appendix (Optional)

- **Glossary of terms**
    
    - **TUI:** Text-based User Interface, the primary interface for the `opencode` application.
        
    - **Vite:** A modern frontend build tool that will replace Bun's built-in bundler.
        
    - **SST:** The Serverless Stack toolkit used for infrastructure and deployment.
        
- **Reference URLs**
    
    - [Vite Documentation](https://vitejs.dev/ "null")
        
    - [Bun to Node.js Migration Guide](https://bun.sh/docs/runtime/nodejs-apis "null")