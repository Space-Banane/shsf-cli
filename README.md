# SHSF CLI

Production-ready command-line tooling for SHSF instances. The CLI manages functions, namespaces, files, triggers, storage, environment variables, CORS, execution, logs, rate limits, and exposes the live SHSF REST and MCP surfaces for agents.

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- An SHSF access token

## Install

```bash
pnpm add -g shsf-cli
```

From source:

```bash
pnpm install
pnpm build
pnpm start -- health
```

## Configuration

The CLI reads configuration in this order:

1. `SHSF_INSTANCE` and `SHSF_TOKEN` environment variables.
2. `~/.shsf_config`, created interactively on first use.

Example non-interactive configuration:

```bash
export SHSF_INSTANCE=https://shsf.example.com
export SHSF_TOKEN=token_xxx
shsf health
```

## Core Commands

```bash
shsf health
shsf uiurl
shsf create namespace --name apps
shsf create function --name api --description "API handler" --image python:3.13 --startup-file main.py --namespace-id 1 --allow-http true
shsf update function 42 --cache-enabled true --cache-ttl 60 --network-restricted true
shsf get function 42
shsf get exec-url --id 42
shsf function execute --id 42 --payload '{"name":"Ada"}' --route users/list --method POST --no-stream
```

Files can be synchronized from a local directory:

```bash
shsf remote push --id 42 --from ./functions/api --force
shsf remote pull --id 42 --to ./functions/api
```

Use `.shsfignore` for gitignore-style push exclusions and `.shsf.json` for local mappings:

```json
{
  "default": {
    "id": "42",
    "from": "functions/api"
  }
}
```

## Current SHSF Features

Typed commands cover the common stable workflows:

- `create|get|update|delete namespace`
- `create|get|update|delete function`
- function execution, dependency install, logs, logging config, rate-limit config
- file create/list/rename/delete
- trigger create/get/update/delete plus run-now
- storage create/list/delete, item get/set/delete/clear
- function and account-level environment variables
- CORS origin list/add/remove/clear
- function counts and health checks

The live backend also exposes admin, global settings, Git source, import/replace, guest, AI, account export, OpenAPI, and MCP routes. Use `shsf api request` for any route without a specialized wrapper:

```bash
shsf api openapi
shsf api request GET /api/functions
shsf api request PATCH /api/function/42/logging --data '{"enabled":true,"hide_payload_headers":true}'
shsf api request POST /api/function/42/git/pull
```

## Agent Use

SHSF exposes an MCP server at `/mcp`. The CLI has direct wrappers for agent bootstrap and tool calls:

```bash
shsf mcp info
shsf mcp init
shsf mcp tools
shsf mcp docs
shsf mcp call list_functions --args '{"namespace":"apps"}'
shsf mcp call write_file --args '{"id":42,"filename":"main.py","content":"def main(args): return {\"ok\": True}"}'
```

Agents should call `shsf mcp docs` before writing SHSF function code. The docs include runtime entry points, `args` shape, v2 response envelope, routing, dependencies, storage, and absolute platform rules.

## CI/CD

This repository uses Gitea Actions in `.gitea/workflows/ci.yml`.

- Build job: checkout, pnpm setup, Node 24, pnpm-store cache, install, test, build, package artifact.
- Publish job on `main`: rebuilds, publishes to npm when `NPM_TOKEN` is configured, and creates a Gitea release when `GITEA_TOKEN` is configured.

GitHub Actions and Copilot-specific instructions were removed.

## Development

```bash
pnpm test
pnpm build
pnpm test:coverage
```

Add a command by creating a file under `src/commands`. Export an object with `name`, `description`, optional `options`, and `action`. Directory names become command groups automatically.

## License

MIT-0
