import chalk from "chalk";
import { readMappingFile } from "./push_helpers.js";

export function resolveFunctionId(options: { id?: string }): string | null {
  if (options.id) {
    return options.id;
  }

  const mapping = readMappingFile();
  if (mapping?.id) {
    console.log(chalk.blue(`Using mapped id ${mapping.id} from .shsf.json`));
    return mapping.id;
  }

  console.error(
    `${chalk.red("✗")} Function ID is required. Use ${chalk.cyan("--id <id>")} or provide an ${chalk.cyan(".shsf.json")} mapping with an ${chalk.cyan("id")}.`,
  );
  return null;
}
