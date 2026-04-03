import fs from "fs";
import path from "path";

export const defaultUnpushableFiles = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yaml",
  "compose.yml",
  "dockerfile",
  "dockerfile.dev",
  "dockerfile.prod",
  ".gitignore",
  ".env",
  ".gitkeep",
  ".md",
];

export function readIgnoreFile(dir: string): string[] {
  const candidates = [path.join(dir, ".shsfignore"), path.join(process.cwd(), ".shsfignore")];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        return fs
          .readFileSync(p, "utf-8")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#"));
      } catch (_err) {
        return [];
      }
    }
  }
  return [];
}

function globToRegExp(pattern: string): RegExp {
  let p = pattern.trim();
  if (!p.includes("*")) {
    if (!p.startsWith("/")) {
      p = `*${p}`;
    }
  }
  // Escape regex special chars, then replace * with .*
  const escaped = p.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

export function matchesAnyPattern(filename: string, patterns: string[]): boolean {
  const name = filename.replace(/\\/g, "/");
  for (const pat of patterns) {
    try {
      const re = globToRegExp(pat);
      if (re.test(name)) return true;
    } catch (_e) {
      if (name.toLowerCase().endsWith(pat.toLowerCase())) return true;
    }
  }
  return false;
}

export function readMappingFile(cwd?: string): { id?: string; from?: string } | null {
  const base = cwd || process.cwd();
  const p = path.join(base, ".shsf.json");
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const json = JSON.parse(raw);
    if (json && typeof json === "object") {
      return (json.default || json) as { id?: string; from?: string };
    }
  } catch (_e) {
    // ignore
  }
  return null;
}

export default null;
