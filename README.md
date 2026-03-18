# 🚀 SHSF CLI

A powerful command-line interface for managing and interacting with your SHSF instance. Built with TypeScript and designed for developers, it provides a seamless experience to perform health checks, run tests, and more—all from your terminal.

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc3534.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-blue.svg)](https://www.typescriptlang.org/)


## 🚦 Getting Started

### 📋 Prerequisites

- **Node.js** (v22+)
- **pnpm** (preferred)

### 📦 Installation

To install **SHSF CLI** globally on your system:

```bash
pnpm add -g shsf-cli
```
or 
```bash
npm install -g shsf-cli
```
---

Once installed, simply type:

```bash
shsf health
```
and it will ask you for your SHSF instance URL and API token to perform a health check.


## 🛠️ Usage & Commands

### 🩺 Health Check
Quickly see if the system is up and running:
```bash
shsf health
```


### 🏗️ Local Development
If you're contributing or running from source:

1. **Setup**:
   ```bash
   git clone https://github.com/Space-Banane/shsf-cli.git
   cd shsf-cli
   pnpm install
   ```

2. **Run**:
   ```bash
   pnpm build      # Build the project
   pnpm start [cmd] # Run a command directly
   ```


## 🤝 Contributing

We love builders! To add a new command:

1. Create a `.ts` file in `src/commands/`.
2. Export a definition object:
   ```typescript
   export const myCommand = {
     name: "run-test",
     description: "Explanation of what it does",
     action: async () => { ... }
   };
   ```
3. Run `pnpm build` and test it with `shsf run-test`.

---

## 📄 License

Licensed under the **MIT-0 License**. Happy coding! 🍌

