# SHSF CLI Project Guidelines

## Architecture
- **Framework**: Built with `commander` for CLI management.
- **Dynamic Commands**: Commands are dynamically loaded from `src/commands/` using recursive directory scanning in [src/commands.ts](src/commands.ts).
- **API Client**: Centralized Axios instance in [src/api.ts](src/api.ts) with standardized headers and singleton pattern for configuration injection.
- **Configuration**: Managed via `loadConfig` in [src/config.ts](src/config.ts), typically using environment variables or local files.

## Code Style
- **TypeScript**: Strict typing is preferred.
- **ES Modules**: The project uses `"type": "module"`. Always use `.js` extensions in imports if required by the runtime/build (though TS usually handles this, be mindful of ESM requirements).
- **Output**: Use `chalk` for terminal styling. Consistent color coding:
  - Green: Success/Healthy
  - Red: Errors/Failures
  - Yellow: Warnings/Pending

## Build and Test
- **Install**: `pnpm install`
- **Build**: `pnpm build` (runs `rimraf dist && tsc`)
- **Run**: `pnpm start [command]` or `node dist/index.js [command]`
- **Binary**: The CLI is named `shsf`.

## Conventions
- **New Commands**: To add a command, create a new file in `src/commands/` (or a subfolder). It must export a definition object (default or named) with `name`, `description`, and `action`.
- **Error Handling**: Follow the pattern in [src/commands/health.ts](src/commands/health.ts) for handling Axios errors (check for `error.response`, `error.request`, etc.).
- **No Global Scope**: Keep command logic within the `action` function or extracted to utility modules to maintain testability.

## Versioning
- **Versioning**: Always increment the version number in package.json whenever a change is merged into main. The version format is major.minor.patch.
