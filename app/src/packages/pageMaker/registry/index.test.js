import { describe, it, expect } from "vitest";

// Import modules directly using import.meta.glob
const modules = import.meta.glob("../../../content/scripts/*.js", {
  eager: true,
});

const scriptRegistry = {};

for (const path in modules) {
  const mod = modules[path];
  if (!mod.scriptTag) continue;
  const tag = mod.scriptTag.toLowerCase();
  if (scriptRegistry[tag]) {
    console.warn(`⚠️ Duplicate scriptTag "${tag}" found in ${path}`);
  }
  scriptRegistry[tag] = {
    mount: mod.mount,
    unmount: mod.unmount,
    module: mod,
    path,
  };
}

describe("Script Registry Path", () => {
  it("should find at least one module in ../../../content/scripts/", () => {
    const paths = Object.keys(modules);
    console.log("\n📦 Discovered modules:\n", paths);
    expect(paths.length).toBeGreaterThan(0);
  });

  it("each module should export a scriptTag", () => {
    for (const [path, mod] of Object.entries(modules)) {
      console.log(`🔍 Checking module: ${path}`);
      console.log(`    scriptTag: ${mod.scriptTag}`);
      expect(mod).toHaveProperty("scriptTag");
      expect(typeof mod.scriptTag).toBe("string");
      expect(mod.scriptTag.length).toBeGreaterThan(0);
    }
  });

  it("final scriptRegistry output", () => {
    console.log("\n📁 Final scriptRegistry:");
    console.log(scriptRegistry);

    expect(Object.keys(scriptRegistry).length).toBeGreaterThan(0);
  });
});
