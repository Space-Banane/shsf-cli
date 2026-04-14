---
name: shsf
description: Interact with the users shsf instance to manage serverless functions, namespaces, triggers, schedules, and more via the CLI.
---

# SHSF - Selfhostable Serverless Functions; THE CLI
The `shsf` CLI tool allows you to interact with your shsf instance to manage serverless functions, namespaces, triggers, schedules, and more. Below are the available commands and their descriptions.

## Setup
To get started, you need to set up the `shsf` CLI tool. Follow the instructions below to install and configure it.

1. Run this
```bash
shsf health
```
this will check the health, and if not setup, it will prompt you to set up the CLI.

## Commands
- `shsf count functions`: Count your functions. Add `--full` to list them.
- `shsf count namespaces`: Count your namespaces. Add `--full` to list them.
- `shsf count storages`: Count your storages. Add `--full` to list them.
- `shsf count triggers`: Count your triggers. Add `--full` to list them.

- `shsf create function`: Create a new function. (use `shsf create function -h` first)
- `shsf create namespace`: Create a new namespace. (use `shsf create namespace -h` first)
- `shsf create trigger`: Create a new trigger. (use `shsf create trigger -h` first)

- `shsf delete function <id>`: Deletes a specific serverless function by its ID.
- `shsf delete namespace <id>`: Deletes a namespace and all its functions by ID.
- `shsf delete trigger <functionId> <triggerId>`: Deletes a specific trigger from a function.

- `shsf get function <id>`: Get details of a specific function by its ID.
- `shsf get namespace <id>`: Get details of a specific namespace by its ID
- `shsf get trigger <functionId> <triggerId>`: Get details of a specific trigger from a function.

- `shsf function execute --id <id> [--payload <json>] [--no-stream]`: Execute a function and stream the output (debug/internal).

- `shsf storage create --name <name> --purpose <purpose>`: Create a new storage.
- `shsf storage delete --name <name>`: Delete a storage.
- `shsf storage list`: List all storages.
- `shsf storage get-items --name <name>`: List all items in a storage.
- `shsf storage set-item --name <name> --key <key> --value <value> [--expires <expires>]`: Set a storage item (value can be JSON).
- `shsf storage delete-item --name <name> --key <key>`: Delete a storage item.
- `shsf storage clear-items --name <name>`: Clear all items from a storage.

- `shsf update function <id>`: Update a specific serverless function by its ID. (use `shsf update function -h` first)
- `shsf update namespace <id>`: Update a specific namespace by its ID. (use `shsf update namespace -h` first)
- `shsf update trigger <functionId> <triggerId>`: Update a specific trigger from a function. (use `shsf update trigger -h` first)

- `shsf file create`: Create/update a file in a function. (use `shsf file create -h` first)
- `shsf file list`: List files in a function. (use `shsf file list -h` first)
- `shsf file rename`: Rename a file in a function. (use `shsf file rename -h` first)
- `shsf file delete`: Delete a file from a function. (use `shsf file delete -h` first)

- `shsf env add --id <id> --name <name> --value <value>`: Adds or updates an environment variable for a function.
- `shsf env remove --id <id> --name <name>`: Removes a specific environment variable from a function.
- `shsf env list --id <id>`: Lists all environment variables for a function.
- `shsf env flush --id <id>`: Removes ALL environment variables from a function.

- `shsf remote pull --id <id> --into <path> [--force]`: Pull files from a function into a local directory.
- `shsf remote push --id <id> --from <path> [--force]`: Push files from a local directory to a function.

- `shsf req add <package> --id <functionid>`: Add a package to the requirements.txt of a function.
- `shsf req remove <package> --id <functionid>`: Remove a package from the requirements.txt of a function.


### Ignore & Mapping files

`shsf remote push` supports a `.shsfignore` file (gitignore-like) placed in the source directory or repository root. Lines are treated like gitignore patterns and will prevent matching files from being pushed.

You can also create a `.shsf.json` mapping file in the repository root so you don't need to pass `--id` and `--from` every time. Example `.shsf.json`:

```json
{
	"default": {
		"id": "my-function-id",
		"from": "src/functions/my-fn"
	}
}
```

Command-line flags take precedence over values in `.shsf.json`.

## Instructions
Use these commands for when you need to interact with shsf from the command line. Its faster than using the ui for almost all ops.

## Ui Links
Get the ui url with:
```bash
shsf uiurl
```

### Example
After creating a function and receiving an ID (for example, 81), you can share the following URL with your human so they can view the function in the UI:
```
[UI_URL]/functions/[ID]
```

## Update
Update with your package manager of choice. ALWAYS pnpm:
```bash
pnpm add -g shsf-cli
```
Note that new features are often released and a user might tell you to do things that are only in the latest version. So its a good idea to always keep it updated.

It is also good practice to update this skill every now and then, as it might get new features that are not documented here yet.
Download the latest version with:
```
curl https://raw.githubusercontent.com/Space-Banane/shsf-cli/refs/heads/main/OpenclawSkill.md > /tmp/OpenclawSkill.md
```
and then replace the old one with the new one using `mv`.

## Missing a feature?
Features might be not documented yet, as this skill document rarely updates.
Use the shsf -h command to see options and features.

CODING DOC:
# SHSF Platform Reference (Agent-Optimized)

## Critical Rules (check before writing any code)

- Python files use `.py`, Go files use `.go` — never mix runtimes
- Go package must be `main`; entry-point must be `main_user()`, never `main()`
- Python entry-point must be `def main(args):`
- **Always** `import json` and call `json.loads(args.get("body", "{}"))` before accessing body fields in Python
- Forbidden filenames: `_runner.py`, `_runner.js`, `init.sh`
- Filenames must never contain `/` or `\` — no subdirectories
- Never hard-code secrets — use environment variables via `os.getenv()`
- Never invent SHSF APIs not documented here
- Never write partial files or placeholder comments
- Only create `requirements.txt` / `go.mod` if dependencies are actually needed

---

## Entry Points

### Python
```python
def main(args):
    return {"hello": "world"}  # plain dict → 200 JSON
```

### Go
```go
package main

func main_user(args interface{}) (interface{}, error) {
    return map[string]string{"hello": "world"}, nil
}
```

---

## The `args` Object

| Field      | Type       | Notes                                                                 |
|------------|------------|-----------------------------------------------------------------------|
| `body`     | string     | Raw JSON string — **must** be parsed with `json.loads()` before use  |
| `queries`  | dict / map | URL query parameters                                                  |
| `route`    | string     | Sub-path segment after function URL. Default: `"default"`            |
| `headers`  | dict / map | Lowercased HTTP request headers                                       |
| `raw_body` | bytes      | Raw request body (file uploads, binary data)                          |
| `method`   | string     | HTTP method (GET, POST, …)                                            |

Always use `.get()` / nil-checks — never assume a field is present.

### Python args example
```python
import json

def main(args):
    body    = json.loads(args.get("body", "{}"))   # always parse first
    queries = args.get("queries", {})
    route   = args.get("route", "default")
    name    = body.get("name", "stranger")
    page    = queries.get("page", "1")
    return {"greeting": f"Hello {name}", "page": page, "route": route}
```

---

## Response Formats

### Simple 200 JSON (plain dict)
```python
return {"key": "value"}
```

### v2 Envelope (control status, headers, body)
```python
return {
    "_shsf":    "v2",
    "_code":    201,                                         # HTTP status code
    "_headers": {"Content-Type": "application/json"},       # optional
    "_res":     {"created": True, "id": 42}                 # response body
}
```

### Error response
```python
return {"_shsf": "v2", "_code": 400, "_res": {"error": "missing field 'name'"}}
```

### Redirect (301 / 302)
```python
return {"_shsf": "v2", "_code": 302, "_location": "https://example.com/target"}
```

### HTML response
```python
def main(args):
    with open("index.html", "r") as f:
        html = f.read()
    return {"_shsf": "v2", "_code": 200, "_headers": {"Content-Type": "text/html"}, "_res": html}
```

> **Static HTML shortcut**: if the only file is a single `.html` set as the startup file, SHSF serves it directly without spinning up a runtime.

---

## Routing

`args["route"]` holds the single URL segment after the function base URL (no leading slash, default `"default"`). Only **one** segment is supported.

```python
def main(args):
    route = args.get("route", "default")
    if route == "register":   return handle_register(args)
    elif route == "login":    return handle_login(args)
    elif route == "status":   return {"status": "ok"}
    else:                     return {"_shsf": "v2", "_code": 404, "_res": {"error": "route not found"}}
```

---

## Environment Variables

Never hard-code secrets. Define them in the SHSF dashboard.

```python
import os

def main(args):
    api_key = os.getenv("MY_API_KEY", "")
    if not api_key:
        return {"_shsf": "v2", "_code": 500, "_res": {"error": "MY_API_KEY not set"}}
    return {"ok": True}
```

Go: `apiKey := os.Getenv("MY_API_KEY")`

---

## Persistent Storage

| Path    | Persistence              | Use for                         |
|---------|--------------------------|---------------------------------|
| `/app/` | Persists across calls    | Cache, state files              |
| `/tmp/` | Wiped on container restart | Truly temporary scratch work  |

**WARNING**: SHSF may restart or update containers, which recreates all of it, even the `/app/` directory. For critical data, use `_db_com` instead.

```python
import json, os

CACHE = "/app/cache.json"

def main(args):
    data = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    data["hits"] = data.get("hits", 0) + 1
    json.dump(data, open(CACHE, "w"))
    return {"hits": data["hits"]}
```

### Redis (shared key-value, fast)
```python
import redis

r = redis.Redis(host="localhost", port=6379, db=0)

def main(args):
    r.incr("counter")
    return {"counter": int(r.get("counter"))}
```

---

## Database (`_db_com`) — Python

`_db_com.py` is auto-provisioned. Add `requests` to `requirements.txt`.

```python
from _db_com import database
from datetime import datetime, timedelta

db = database()

def main(args):
    db.create_storage("my_app", purpose="application data")  # idempotent, safe every call

    db.set("my_app", "username", "alice")                    # write

    expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    db.set("my_app", "session", "tok_abc", expires_at=expires)  # write with TTL

    username = db.get("my_app", "username")                  # read (None if missing)
    exists   = db.exists("my_app", "username")               # existence check
    items    = db.list_items("my_app")                       # list all keys
    db.delete_item("my_app", "username")                     # delete

    return {"username": username, "items": items}
```

### Go `dbcom`
```go
package main

import "myfunction/dbcom"

func main_user(args interface{}) (interface{}, error) {
    db := dbcom.New()
    if _, err := db.Set("my-storage", "key", "value", nil); err != nil {
        return nil, err
    }
    value, err := db.Get("my-storage", "key")
    if err != nil {
        return nil, err
    }
    return map[string]interface{}{"value": value}, nil
}
```

---

## File Uploads / Raw Body

```python
def main(args):
    raw = args.get("raw_body")
    if raw is None:
        return {"_shsf": "v2", "_code": 400, "_res": {"error": "no body provided"}}
    if isinstance(raw, str):
        raw = raw.encode("latin-1")
    with open("/app/upload.bin", "wb") as f:
        f.write(raw)
    return {"_shsf": "v2", "_code": 200, "_res": {"saved": True}}
```

---

## Secure Header (`x-secure-header`)

When the secure-header feature is enabled, SHSF validates the token **before** invoking your function — no need to re-validate. Read it only for logging:

```python
def main(args):
    token = args.get("headers", {}).get("x-secure-header", "")
    return {"authenticated": True, "token_preview": token[:4] + "…"}
```

---

## Dependency Files

| Runtime | File              | Notes                                          |
|---------|-------------------|------------------------------------------------|
| Python  | `requirements.txt`| pip-installed before first run                 |
| Go      | `go.mod`+`go.sum` | Module deps, auto-downloaded                   |

Only create these files if you have actual dependencies.

### Python `requirements.txt`
```
requests==2.31.0
beautifulsoup4==4.12.2
```

### Go `go.mod`
```
module myfunction

go 1.23

require (
    github.com/google/uuid v1.3.0
)
```

Supported Go versions: `1.20`, `1.21`, `1.22`, `1.23`