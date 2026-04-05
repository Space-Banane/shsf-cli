import { describe, it, expect } from "vitest";
import {
  listFiles,
  createOrUpdateFile,
  deleteFile,
  renameFile,
} from "../utils/fileops.js";

function makeClient(overrides: any = {}) {
  return {
    get: async (u: string) => ({ status: 200, data: { data: overrides.getData || [] } }),
    put: async (u: string, p: any) => ({ status: overrides.putStatus || 200, data: { ok: true } }),
    delete: async (u: string, opts: any) => ({ status: overrides.deleteStatus || 200, data: {} }),
    patch: async (u: string, p: any) => ({ status: overrides.patchStatus || 200, data: {} }),
  };
}

describe("fileops", () => {
  it("lists files", async () => {
    const client = makeClient({ getData: [{ id: "1", name: "a.txt" }] });
    const files = await listFiles(client, "fn1");
    expect(files).toHaveLength(1);
    const file = files[0];
    expect(file).toHaveProperty("id");
    expect(file.id).toBe("1");
    // Accept either `name` or `filename` depending on API shape
    expect(file.name || file.filename).toBe("a.txt");
  });

  it("creates or updates a file", async () => {
    const client = makeClient({ putStatus: 201 });
    const res = await createOrUpdateFile(client, "fn1", "a.txt", "hello");
    expect(res).toBeDefined();
  });

  it("deletes a file", async () => {
    const client = makeClient({ deleteStatus: 200 });
    const ok = await deleteFile(client, "fn1", "file1");
    expect(ok).toBe(true);
  });

  it("renames a file", async () => {
    const client = makeClient({ patchStatus: 200 });
    const res = await renameFile(client, "fn1", "file1", "b.txt");
    expect(res).toBeDefined();
  });
});
