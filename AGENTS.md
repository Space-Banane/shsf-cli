# Agent Notes for SHSF CLI

This repository is the TypeScript CLI for SHSF. The sibling repository `../shsf` is the authoritative source for backend routes, request bodies, MCP tools, and platform behavior.

## Before Changing Commands

1. Inspect `../shsf/Backend/src/routes` for the live REST route.
2. Inspect `../shsf/Backend/src/lib/mcp` for agent-facing MCP tool behavior.
3. Prefer updating typed command wrappers for common workflows and rely on `shsf api request` for rare or admin-only routes.
4. Run `pnpm test` and `pnpm build` before considering the change complete.

## Command Architecture

Commands are auto-loaded from `src/commands`. Directory names become command groups. Each command file exports a definition object:

```ts
export const commandDefinition = {
  name: "example <arg>",
  description: "Do something",
  options: [{ name: "--flag <value>", description: "Example option" }],
  action: async (arg: string, options: any) => {}
};
```

Use `getApiClient()` from `src/api.ts` for REST calls. It handles `SHSF_INSTANCE`, `SHSF_TOKEN`, auth headers, content type, user agent, and timeout.

## Current Backend Alignment

The live backend expects function settings under `settings` for fields such as:

- `allow_http`
- `secure_header`
- `max_ram`
- `timeout`
- `tags`
- `retry_on_failure`
- `retry_count`
- `cache_enabled`
- `cache_ttl`

Top-level function fields include runtime/container controls such as `image`, `startup_file`, `namespaceId`, `executionAlias`, `docker_mount`, `network_restricted`, `ffmpeg_install`, `opencv_install`, `imported`, `ai_kicked_off`, and `cors_origins`.

## Agent-Ready Interfaces

Keep these commands working because they let agents recover when the typed CLI surface is behind the backend:

- `shsf api openapi`
- `shsf api request <method> <path>`
- `shsf mcp info`
- `shsf mcp init`
- `shsf mcp tools`
- `shsf mcp docs`
- `shsf mcp call <tool>`

Agents writing SHSF function source should call `shsf mcp docs` first. The SHSF MCP server also instructs clients to call `get_docs` before writing function code.

## CI/CD

Use Gitea Actions only. Workflow files live in `.gitea/workflows`. Do not add GitHub Actions or Copilot instructions back unless the project owner explicitly requests that migration.

The workflow should keep pnpm-store caching, test/build gates, npm publish guarded by `NPM_TOKEN`, and Gitea release creation guarded by `GITEA_TOKEN`.
