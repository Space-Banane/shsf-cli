import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function resolveCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(commandsPath)) return;

  const commandFiles = getCommandFiles(commandsPath);

  // Group commands by their directory relative to 'commands'
  const groupMap = new Map<string, any>();
  groupMap.set('', program);

  for (const absolutePath of commandFiles) {
    const relativePathFromCommands = path.relative(commandsPath, absolutePath);
    const pathParts = path.dirname(relativePathFromCommands).split(path.sep).filter(p => p !== '.');
    
    let currentParent = program;
    let currentGroupPath = '';

    for (const part of pathParts) {
      currentGroupPath = currentGroupPath ? path.join(currentGroupPath, part) : part;
      if (!groupMap.has(currentGroupPath)) {
        const groupCommand = currentParent.command(part).description(`${part} commands`);
        groupMap.set(currentGroupPath, groupCommand);
      }
      currentParent = groupMap.get(currentGroupPath);
    }

    const relativeImportPath = './' + path.relative(__dirname, absolutePath).replace(/\\/g, '/');
    const module = await import(relativeImportPath);
    
    // Look for a definition object (e.g., healthDefinition) or a default export with name/description/action
    const definition = module.default || Object.values(module).find((val: any) => val && val.name && val.action);

    if (definition && definition.name && definition.action) {
      const command = currentParent
        .command(definition.name)
        .description(definition.description || '');

      if (definition.options) {
        definition.options.forEach((opt: any) => {
          if (opt.required) {
            command.requiredOption(opt.name, opt.description);
          } else {
            command.option(opt.name, opt.description);
          }
        });
      }

      command.action(definition.action);
    }
  }
}
