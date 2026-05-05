import { describe, expect, it } from "vitest";
import { buildFunctionExecUrls } from "../utils/function_exec_url.js";

describe("buildFunctionExecUrls", () => {
  it("builds the ID-based execution URL and trims trailing slashes", () => {
    expect(
      buildFunctionExecUrls("https://example.com/", {
        namespaceId: 4,
        executionId: "abc-123",
      }),
    ).toEqual({
      executionUrl: "https://example.com/api/exec/4/abc-123",
    });
  });

  it("includes the alias URL when the function has an execution alias", () => {
    expect(
      buildFunctionExecUrls("https://example.com", {
        namespaceId: 7,
        executionId: "uuid-456",
        executionAlias: "friendly-name",
      }),
    ).toEqual({
      executionUrl: "https://example.com/api/exec/7/uuid-456",
      aliasUrl: "https://example.com/exec/friendly-name",
    });
  });

  it("throws when required execution URL fields are missing", () => {
    expect(() =>
      buildFunctionExecUrls("https://example.com", {
        executionAlias: "friendly-name",
      }),
    ).toThrow("Function response is missing execution URL fields.");
  });
});
