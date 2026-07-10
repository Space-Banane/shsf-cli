import fs from "fs";

export function parseJsonInput(input: string, label = "JSON"): unknown {
  try {
    return JSON.parse(input);
  } catch (error: any) {
    throw new Error(`Invalid ${label}: ${error.message}`);
  }
}

export function readJsonInput(options: {
  data?: string;
  dataFile?: string;
  defaultValue?: unknown;
}): unknown {
  if (options.data !== undefined && options.dataFile !== undefined) {
    throw new Error("Use either --data or --data-file, not both.");
  }

  if (options.dataFile !== undefined) {
    return parseJsonInput(
      fs.readFileSync(options.dataFile, "utf-8"),
      `${options.dataFile} JSON`,
    );
  }

  if (options.data !== undefined) {
    return parseJsonInput(options.data, "JSON");
  }

  return options.defaultValue ?? {};
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
