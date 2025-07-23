// src/packages/pageMaker/resourceLoader/loadLoginView.integration.test.js

import { describe, it, expect } from "vitest";
import { Loader, getCached } from "./index.js";
import { getViewRegistry } from "../registry/index.js";

describe("Integration: Loader.loadView('login')", () => {
  it(
    "loads and executes the login script and page using the real registry",
    async () => {
      const registry = getViewRegistry();
      console.log("✅ View registry loaded:", JSON.stringify(registry, null, 2));

      const loginView = registry.views.find((v) => v.view_name === "login");
      expect(loginView).toBeDefined();
      expect(loginView.page).toBe("login.html");

      Loader.init(registry);
      await Loader.loadView("login");

      expect(getCached("login.html")).toBeDefined();
      expect(getCached("script:login_script")).toBeDefined();

      console.log("🧪 typeof window:", typeof window);
      console.log("🧪 window.__loginScriptLoaded =", window.__loginScriptLoaded);
      expect(window.__loginScriptLoaded).toBe(true);

      if (loginView.preload?.images?.length) {
        for (const imgPath of loginView.preload.images) {
          const cached = getCached(imgPath);
          console.log(`🧪 Image preload [${imgPath}] =`, cached);

          expect(cached).toBeDefined();
          expect(typeof cached).toBe("object");
        }
      } else {
        console.warn("⚠️ No images defined in preload.images");
      }

      const snapshot = Object.fromEntries(
        Object.entries(registry).filter(([k]) => k === "login")
      );
      console.log("🔍 Loaded registry for login:", snapshot);
    },
    20000
  );
});
