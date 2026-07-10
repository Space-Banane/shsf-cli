export type EnvVar = { name: string; value: string };

export function normalizeEnvList(value: unknown): EnvVar[] {
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is EnvVar =>
      item &&
      typeof item === "object" &&
      typeof (item as EnvVar).name === "string" &&
      typeof (item as EnvVar).value === "string",
    )
    .map((item) => ({ name: item.name, value: item.value }));
}
