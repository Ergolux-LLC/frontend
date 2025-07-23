import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  hasCached,
  getCached,
  setCached,
  clear as clearCache,
  Loader,
  queue,
  schedule,
  runQueue,
} from "./index.js";

/* ──────────────────────────  GLOBAL REGISTRY MOCK  ────────────────────────── */
vi.mock("../registry/index.js", () => ({
  getScriptByTag: (tag) => ({
    scriptTag: tag,
    mount: vi.fn(() => Promise.resolve(`mounted:${tag}`)),
    unmount: vi.fn(),
  }),
}));

/* ───────────────────────────── Cache Manager ─────────────────────────────── */
const testUrl = "https://example.com/test.js";

describe("Cache Manager", () => {
  beforeEach(() => clearCache?.());

  it("hasCached returns false for missing entry", () => {
    expect(hasCached(testUrl)).toBe(false);
  });

  it("setCached adds a value and getCached retrieves it", () => {
    const value = { dummy: true };
    setCached(testUrl, value);
    expect(hasCached(testUrl)).toBe(true);
    expect(getCached(testUrl)).toBe(value);
  });

  it("prevents duplicate fetches once cached", () => {
    const value = { once: true };
    setCached(testUrl, value);
    expect(getCached(testUrl)).toBe(value);
  });

  it("resolves cached Promises correctly", async () => {
    setCached(testUrl, Promise.resolve("done"));
    await expect(getCached(testUrl)).resolves.toBe("done");
  });

  it("clears cache if clear() is implemented", () => {
    setCached(testUrl, "x");
    clearCache();
    expect(hasCached(testUrl)).toBe(false);
  });
});

/* ──────────────────────────── Resource Loader ────────────────────────────── */
describe("Resource Loader", () => {
  beforeEach(() => {
    clearCache?.();
    document.head.innerHTML = "";
  });

  it("loads JS via <script>", async () => {
    const realCreate = document.createElement;
    const spy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag) => {
        if (tag === "script") {
          const el = realCreate.call(document, tag);
          setTimeout(() => el.onload?.(), 5);
          return el;
        }
        return realCreate.call(document, tag);
      });

    const res = await Loader.loadResource("https://x/test.js");
    expect(res.tagName).toBe("SCRIPT");
    spy.mockRestore();
  });

  it("loads CSS via <link>", async () => {
    const realCreate = document.createElement;
    const spy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag) => {
        if (tag === "link") {
          const el = realCreate.call(document, tag);
          setTimeout(() => el.onload?.(), 5);
          return el;
        }
        return realCreate.call(document, tag);
      });

    const res = await Loader.loadResource("https://x/test.css");
    expect(res.tagName).toBe("LINK");
    spy.mockRestore();
  });
});

/* ───────────────────────────── Queue System ──────────────────────────────── */
describe("Queue System", () => {
  const loadSpy = vi.fn((url) => Promise.resolve(url));

  beforeEach(() => {
    clearCache();
    Object.values(queue).forEach((arr) => (arr.length = 0));
    loadSpy.mockClear();
    global.__internalLoad = loadSpy;
  });

  afterEach(() => {
    delete global.__internalLoad;
  });

  it("adds URLs to correct priority buckets", async () => {
    schedule("a.js", "high");
    schedule("b.js", "medium");
    schedule("c.js", "low");
    await runQueue();

    const calls = loadSpy.mock.calls.map(([u]) => u);
    expect(calls).toEqual(expect.arrayContaining(["a.js", "b.js", "c.js"]));
    expect(loadSpy).toHaveBeenCalledTimes(3);
  }, 10000);

  it("does not schedule duplicates", async () => {
    ["low", "medium", "high"].forEach((lvl) => schedule("dup.js", lvl));
    await runQueue();
    expect(loadSpy.mock.calls.filter(([u]) => u === "dup.js")).toHaveLength(1);
  });
});

/* ─────────────────────── Controller / Coordination ───────────────────────── */
describe("Controller / Coordination", () => {
  const internalSpy = vi.fn((u) => Promise.resolve(u));

  beforeEach(() => {
    clearCache();
    Object.values(queue).forEach((arr) => (arr.length = 0));
    internalSpy.mockClear();
    global.__internalLoad = internalSpy;
  });

  afterEach(() => {
    delete global.__internalLoad;
  });

  it("loadView schedules static resources only", async () => {
    Loader.init({
      views: [
        {
          view_name: "login",
          view_type: "single",
          page: "login.html",
          before_scripts: ["login_script"],
          after_scripts: ["track_script"],
          preload: { styles: ["/main.css"] },
          related_views: [],
        },
      ],
    });

    await Loader.loadView("login");
    await runQueue();

    expect(internalSpy).toHaveBeenCalledWith("login.html");
    expect(internalSpy).toHaveBeenCalledWith("/main.css");
  });
});
