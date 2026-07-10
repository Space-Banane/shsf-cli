import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

function getFilesRecursively(dir: string): string[] {
  let files: string[] = [];
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      if (item !== '__tests__') {
        files = files.concat(getFilesRecursively(fullPath));
      }
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('API URL validation', () => {
  it('should ensure API client calls use known SHSF route prefixes', () => {
    const tsFiles = getFilesRecursively('src');
    const violations: string[] = [];

    // Regex to match common patterns like client.get('/path') or client.post(`/path`)
    // specifically looking for paths that start with / but NOT known SHSF prefixes.
    const urlPattern = /client\.(get|post|put|delete|patch)\(['"`]\/(?!(api|health|mcp)(\/|['"`]))[^'"`]+['"`]/g;

    tsFiles.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      let match;
      while ((match = urlPattern.exec(content)) !== null) {
        // Double check exact non-API endpoints without trailing slash.
        if (
          match[0].includes("'/health'") ||
          match[0].includes('"/health"') ||
          match[0].includes('`/health`') ||
          match[0].includes("'/mcp'") ||
          match[0].includes('"/mcp"') ||
          match[0].includes('`/mcp`')
        ) {
          continue;
        }
        violations.push(`${file}: ${match[0]}`);
      }
    });

    expect(violations, `Found client calls outside known SHSF prefixes:\n${violations.join('\n')}`).toHaveLength(0);
  });
});
