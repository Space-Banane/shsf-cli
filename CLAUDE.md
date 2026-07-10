# Claude Notes for SHSF CLI

Work from current evidence. The sibling repo `../shsf` is the source of truth for SHSF backend routes and MCP behavior.

## Fast Orientation

- CLI source: `src`
- Command loader: `src/commands.ts`
- REST client: `src/api.ts`
- Config: `src/config.ts`
- Tests: `src/__tests__`
- Gitea CI/CD: `.gitea/workflows/ci.yml`

## Backend Checks

When updating route support, inspect these files in `../shsf`:

- `Backend/src/routes` for REST paths and request schemas
- `Backend/src/routes/mcp.ts` and `Backend/src/lib/mcp` for MCP behavior
- `Backend/src/lib/aidoc.ts` for function-authoring rules returned by `get_docs`

Do not infer backend payloads from old CLI code when the backend source is available.

## Agent Workflow

Use these commands for discovery:

```bash
shsf api openapi
shsf mcp init
shsf mcp tools
shsf mcp docs
```

Use `shsf api request <method> <path>` for live REST endpoints that do not yet have typed wrappers.

Before writing SHSF function code, call `shsf mcp docs` or the MCP `get_docs` tool and follow the returned platform rules.

## Verification

Run:

```bash
pnpm test
pnpm build
```

Keep changes scoped. Do not reintroduce removed GitHub workflow metadata, editor-specific instruction files, or skill markdown files unless explicitly requested.
