import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Content directory check", () => {
  it("should confirm that the content directory exists", () => {
    const contentDir = path.resolve(__dirname, "../../../content");
    const exists =
      fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory();

    expect(exists).toBe(true);
  });
});
