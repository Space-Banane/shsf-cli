import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Command Loading', () => {
  it('all command files should export a valid definition', async () => {
    const commandsDir = path.resolve(__dirname, '../commands');
    
    function getCommandFiles(dir: string): string[] {
      const files = fs.readdirSync(dir);
      let commandFiles: string[] = [];

      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          commandFiles = commandFiles.concat(getCommandFiles(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
          commandFiles.push(fullPath);
        }
      }

      return commandFiles;
    }

    const files = getCommandFiles(commandsDir);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      // Use dynamic import to check the module
      // We convert absolute path to file:// URL for ESM import on Linux/Windows
      const module = await import(`file://${file}`);
      
      const definition = module.default || Object.values(module).find((val: any) => 
        val && typeof val === 'object' && val.name && typeof val.action === 'function'
      );

      if (!definition) {
        throw new Error(`Command file ${file} does not export a valid command definition (needs name and action function)`);
      }

      expect(definition).toBeDefined();
      expect(typeof definition.name).toBe('string');
      expect(typeof definition.action).toBe('function');
      
      console.log(`✓ Validated command: ${definition.name} (${path.relative(commandsDir, file)})`);
    }
  }, 20000);
});
