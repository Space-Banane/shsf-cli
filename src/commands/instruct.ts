import chalk from "chalk";

const AIDOC = `
## SHSF Platform Reference — read this carefully before writing any code

---

### 1. Entry-point conventions

Every function MUST expose a single entry-point that the SHSF runtime calls.

**Python** (file extension: .py)
\`\`\`python
def main(args):
    # args is a dict injected by the runtime (see §2)
    return {"hello": "world"}  # plain dict → 200 JSON response
\`\`\`

**Go** (file extension: .go, package must be \`main\`)
\`\`\`go
package main

func main_user(args interface{}) (interface{}, error) {
    return map[string]string{"hello": "world"}, nil
}
\`\`\`
• Go functions MUST use \`main_user\`, NOT \`main\`, as the user entry-point.
• Dependencies go in a \`go.mod\` file (auto-downloaded by the runtime).
• Supported Go versions: 1.20 / 1.21 / 1.22 / 1.23

**.NET / C#** (project-based runtime)
\`\`\`csharp
using SHSF;

var args = Runtime.LoadPayloadJson<Dictionary<string, JsonElement?>>();
Runtime.Return(new { hello = "world" });
\`\`\`
• .NET functions are project-based: include a runnable \`.csproj\` and C# source files.
• Do NOT use \`func.startup_file\` for .NET. The startup file should be an empty string.
• Your code can use \`Runtime.LoadPayload()\`, \`Runtime.LoadPayloadJson<T>()\`, and \`Runtime.Return(object)\` from the auto-provisioned \`SHSF.Runtime.cs\` helper.
• Supported .NET SDK images: 8.0 / 9.0 / 10.0

---

### 2. The \`args\` object

The runtime injects these fields. Always use .get() / nil-checks — never assume a field is present.

| Field      | Type          | Description                                                  |
|------------|---------------|--------------------------------------------------------------|
| body       | string        | Raw JSON string of the HTTP POST body — MUST be parsed with json.loads() before use |
| queries    | dict / map    | URL query parameters (?key=value)                            |
| route      | string        | Sub-path after the function URL (no leading slash). Default: "default" |
| headers    | dict / map    | Incoming HTTP request headers (lowercased keys)              |
| raw_body   | bytes/string  | Raw request body bytes (for file uploads, binary data)       |
| method     | string        | HTTP method (GET, POST, PUT, PATCH, DELETE, QUERY, …)        |

> ⚠️  \`body\` is a raw JSON string — you MUST call \`json.loads(body)\` before accessing fields.

Python example:
\`\`\`python
import json

def main(args):
    body    = args.get("body", "{}")
    body    = json.loads(body)          # ← required: parse the JSON string first
    queries = args.get("queries", {})
    route   = args.get("route", "default")
    name    = body.get("name", "stranger")
    page    = queries.get("page", "1")
    return {"greeting": f"Hello {name}", "page": page, "route": route}
\`\`\`

---

### 3. Custom responses (SHSF v2 protocol)

Return a plain dict/map for a simple 200 JSON response.
Return the v2 envelope to control status code, headers, and body:

\`\`\`python
def main(args):
    return {
        "_shsf": "v2",
        "_code": 201,
        "_headers": {"X-My-Header": "value", "Content-Type": "application/json"},
        "_res": {"created": True, "id": 42}
    }
\`\`\`

v2 envelope fields:
- _shsf (required): must be "v2"
- _code (int): HTTP status code to return
- _res (any): response body (string, dict, …)
- _headers (dict): extra response headers to send
- _location (string): redirect URL — only valid when _code is 301 or 302

---

### 4. Redirects

Set _code to 301 (permanent) or 302 (temporary) AND supply _location:

\`\`\`python
def main(args):
    return {"_shsf": "v2", "_code": 302, "_location": "https://example.com/target"}
\`\`\`

---

### 5. Environment variables

Define them in the SHSF dashboard — NEVER hard-code secrets in source files.

\`\`\`python
import os

def main(args):
    api_key = os.getenv("MY_API_KEY", "")
    if not api_key:
        return {"_shsf": "v2", "_code": 500, "_res": {"error": "MY_API_KEY not set"}}
    return {"ok": True}
\`\`\`

---

### 6. Persistent storage

- /app/  — files persist between invocations. Use for cached data, state files, etc.
- /tmp/  — ephemeral; wiped between container restarts.

---

### 7. SHSF Database Communication (_db_com) — Python

\`\`\`python
from _db_com import database

db = database()

def main(args):
    db.create_storage("my_app", purpose="application data")
    db.set("my_app", "username", "alice")
    username = db.get("my_app", "username")
    items = db.list_items("my_app")
    db.delete_item("my_app", "username")
    return {"username": username, "items": items}
\`\`\`

Go dbcom equivalent:
\`\`\`go
package main

import "myfunction/dbcom"

func main_user(args interface{}) (interface{}, error) {
    db := dbcom.New()
    if _, err := db.Set("my-storage", "key", "value", nil); err != nil {
        return nil, err
    }
    value, err := db.Get("my-storage", "key")
    if err != nil { return nil, err }
    return map[string]interface{}{"value": value}, nil
}
\`\`\`

---

### 8. Routing

args["route"] contains the URL sub-path after the function base URL (no leading slash).
Default when no sub-path is given: "default".

\`\`\`python
def main(args):
    route = args.get("route", "default")
    if route == "register":
        return handle_register(args)
    elif route == "login":
        return handle_login(args)
    else:
        return {"_shsf": "v2", "_code": 404, "_res": {"error": "route not found"}}
\`\`\`

---

### 9. Serving HTML

\`\`\`python
def main(args):
    with open("index.html", "r") as f:
        html = f.read()
    return {"_shsf": "v2", "_code": 200, "_headers": {"Content-Type": "text/html"}, "_res": html}
\`\`\`

For a fully static page: one .html file as the startup file, zero other files — SHSF serves it directly.

---

### 10. Raw body / file uploads

\`\`\`python
def main(args):
    raw = args.get("raw_body")
    if raw is None:
        return {"_shsf": "v2", "_code": 400, "_res": {"error": "no body provided"}}
    if isinstance(raw, str):
        raw = raw.encode("latin-1")
    with open("/app/upload.bin", "wb") as f:
        f.write(raw)
    return {"_shsf": "v2", "_code": 200, "_res": {"saved": True}}
\`\`\`

---

### 11. Secure headers (x-secure-header)

When a function has secure-header enabled, SHSF validates the x-secure-header before
invoking — you do NOT need to re-validate it in your code.

---

### 12. Dependency files

| Runtime | File            | How it works                              |
|---------|-----------------|-------------------------------------------|
| Python  | requirements.txt | pip-installed before first run            |
| Go      | go.mod + go.sum | module dependencies, auto-downloaded      |
| .NET    | .csproj         | NuGet restore/build handled by dotnet CLI |

---

### 13. Absolute rules — violations will cause the function to fail

- When the image is set to python, don't create go files, and vice versa.
- Only create files allowed by the runtime file policy.
- If no packages are needed, don't create a requirements.txt or go.mod file.
- FORBIDDEN filenames: _runner.py, _runner.js, init.sh  (reserved by the SHSF runtime)
- Filenames must NEVER contain / or \\ (no subdirectories)
- Never write partial files or placeholder comments like "# ... rest of code"
- Never hard-code secrets — always use environment variables (§5)
- Go entry-point is main_user(), never main()
- .NET functions must include a runnable .csproj and return results via Runtime.Return(...)
- Never invent SHSF-specific APIs that are not documented in this reference
- Always \`import json\` and call \`json.loads(args.get("body", "{}"))\` in Python before accessing body fields
`;

const CLI_OVERVIEW = `
SHSF CLI — Command Overview
════════════════════════════════════════════════════════

Command groups:

  api         Raw REST access  (api request, api openapi)
  mcp         MCP tools access (mcp init, mcp tools, mcp call, mcp docs)
  create      Create resources (function, namespace, trigger)
  update      Update resources (function, namespace, trigger)
  delete      Delete resources (function, namespace, trigger)
  get         Fetch details    (function, namespace, trigger, exec-url)
  remote      Sync files       (remote push, remote pull)
  file        Manage files     (file list, file create, file delete, file rename)
  env         Function env vars (env add, env list, env remove, env flush)
  account     Account-level env vars (account env add, account env list, …)
  function    Function extras  (function logs, function execute, function ratelimit)
  storage     Key-value store  (storage create, storage list, storage set-item, …)
  cors        CORS config      (cors add, cors list, cors remove, cors clear)
  count       Quick counts     (count functions, count namespaces, …)
  req         Requirements     (req add, req remove)
  health      Health check
  uiurl       Print the dashboard URL

Discovery commands (no auth required):

  shsf api openapi        — print the full OpenAPI spec
  shsf mcp init           — print MCP server config for this instance
  shsf mcp tools          — list all available MCP tools
  shsf mcp docs           — print the live function authoring reference
  shsf mcp call <tool>    — call any MCP tool by name

Authentication is read from the environment:

  SHSF_INSTANCE   Base URL of your SHSF instance   (e.g. https://shsf.example.com)
  SHSF_TOKEN      API token for authenticated calls
`;

export const instructDefinition = {
  name: "instruct",
  description:
    "IMPORTANT: Read this before using the CLI — SHSF platform overview, CLI command reference, and function authoring rules for humans and agents.",
  action: () => {
    // ── Human section ──────────────────────────────────────────────────────
    console.log(chalk.bold.cyan("\n╔══════════════════════════════════════════════╗"));
    console.log(chalk.bold.cyan("║           SHSF CLI — Getting Started         ║"));
    console.log(chalk.bold.cyan("╚══════════════════════════════════════════════╝\n"));

    console.log(chalk.bold("What is SHSF?"));
    console.log(
      "SHSF is a self-hosted serverless function platform. You deploy short-lived\n" +
      "functions (Python, Go, or .NET/C#) that are invoked over HTTP. The CLI lets\n" +
      "you manage functions, namespaces, files, environment variables, storage, and\n" +
      "more — all from the terminal or scripts.\n"
    );

    console.log(chalk.bold("Quick start for humans:"));
    console.log(
      "  1. Set SHSF_INSTANCE and SHSF_TOKEN in your environment.\n" +
      "  2. Run  shsf health  to verify the connection.\n" +
      "  3. Run  shsf create function  to create your first function.\n" +
      "  4. Use  shsf remote push  to upload source files.\n" +
      "  5. Use  shsf get exec-url  to get the callable URL.\n" +
      "  6. Run  shsf -h  for the full command list at any time.\n"
    );

    console.log(CLI_OVERVIEW);

    // ── Agent section ───────────────────────────────────────────────────────
    console.log(chalk.bold.yellow("╔══════════════════════════════════════════════╗"));
    console.log(chalk.bold.yellow("║     FOR AI AGENTS — Function Authoring       ║"));
    console.log(chalk.bold.yellow("╚══════════════════════════════════════════════╝\n"));

    console.log(
      "If you are an AI agent writing or editing SHSF functions, the section below\n" +
      "is your authoritative reference. Follow every rule in §13 or the function\n" +
      "will fail to run. Use  shsf mcp docs  to fetch the live version of this\n" +
      "reference directly from the connected SHSF instance.\n"
    );

    console.log(AIDOC);

    console.log(chalk.dim("─────────────────────────────────────────────────────"));
    console.log(chalk.dim("Tip: run  shsf mcp docs  to fetch the live reference from your instance."));
    console.log(chalk.dim("Tip: run  shsf -h  to see all available commands.\n"));
  },
};
