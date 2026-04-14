export function parseCorsOriginsOption(rawValue: unknown): { corsOrigins?: string[]; error?: string } {
  if (rawValue === undefined || rawValue === null) {
    return {};
  }

  const tokens = Array.isArray(rawValue) ? rawValue : [rawValue];
  const splitValues = tokens
    .map((value) => String(value).trim())
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (splitValues.length === 0) {
    return { error: "No valid values were provided for --cors-origins." };
  }

  const uniqueOrigins: string[] = [];
  const seen = new Set<string>();

  for (const origin of splitValues) {
    let parsed: URL;

    try {
      parsed = new URL(origin);
    } catch {
      return { error: `Invalid CORS origin URL: ${origin}` };
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { error: `Invalid CORS origin protocol for ${origin}. Only http and https are allowed.` };
    }

    const normalizedOrigin = parsed.origin;

    if (!seen.has(normalizedOrigin)) {
      seen.add(normalizedOrigin);
      uniqueOrigins.push(normalizedOrigin);
    }
  }

  return { corsOrigins: uniqueOrigins };
}
