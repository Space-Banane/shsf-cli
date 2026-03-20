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

- `shsf file create`: Create a file in a storage. (use `shsf file create -h` first)
- `shsf file overwrite`: Overwrite an existing file in a storage. (use `shsf file overwrite -h` first)
- `shsf file delete`: Delete a file from a storage. (use `shsf file delete -h` first)
- `shsf file list`: List files in a storage. (use `shsf file list -h` first)

- `shsf remote pull --id <id> --into <path> [--force]`: Pull files from a function into a local directory.
- `shsf remote push --id <id> --from <path> [--force]`: Push files from a local directory to a function.

## Instructions
Use these commands for when you need to interact with shsf from the command line. Its faster than using the ui for almost all ops.

## Ui Links
Get the ui url with:
```bash
shsf uiurl
```

## Available UI Routes

Below are the main routes you can use in the SHSF web UI. These are not clickable links, but you can navigate to them in your browser.

**General**
- `/`: Home Page

**Documentation**
- `/docs`: Documentation

**Account**
- `/account`: Account Settings
- `/login`: Login
- `/register`: Register

**Functions**
- `/functions`: Shows your functions, grouped by their respective namespaces (requires auth).
- `/functions/:id`: View details for a specific function (requires auth).

**Other**
- `/admin`: Admin dashboard (admin only, requires authentication)
- `/storage`: Storage management (requires auth)
- `/cron-jobs`: Cron job management (requires auth)
- `/access-tokens`: Access token management (requires auth)
- `/guest-users`: Guest user management (requires auth)
- `/guest-access`: Guest access portal

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