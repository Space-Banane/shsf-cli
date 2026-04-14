import { describe, expect, it } from "vitest";
import { parseCorsOriginsOption } from "../utils/cors.js";

describe("parseCorsOriginsOption", () => {
  it("returns undefined when no value is provided", () => {
    expect(parseCorsOriginsOption(undefined)).toEqual({});
  });

  it("parses, normalizes, and deduplicates URLs", () => {
    const parsed = parseCorsOriginsOption([
      "https://example.com",
      "https://example.com/path",
      "http://localhost:3000,http://localhost:3000/",
    ]);

    expect(parsed).toEqual({
      corsOrigins: ["https://example.com", "http://localhost:3000"],
    });
  });

  it("returns an error for invalid URLs", () => {
    const parsed = parseCorsOriginsOption(["not-a-url"]);
    expect(parsed.error).toMatch("Invalid CORS origin URL");
  });

  it("returns an error for unsupported protocols", () => {
    const parsed = parseCorsOriginsOption(["ftp://example.com"]);
    expect(parsed.error).toMatch("Only http and https are allowed");
  });
});
