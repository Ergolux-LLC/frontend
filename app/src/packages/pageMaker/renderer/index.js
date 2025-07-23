/*  src/packages/pageMaker/renderer/index.js
 *  ---------------------------------------------------------------------------
 *  Single responsibility: take a “render” event from #content and turn the
 *  view‑name into fully‑rendered HTML + mounted after‑scripts.  <body> remains
 *  hidden (visibility:hidden) until the **first** render cycle is 100 % done,
 *  so the user never sees an un‑styled flash.
 *  ---------------------------------------------------------------------------
 */

import { Loader, getCached } from "../resourceLoader/index.js";
import { getViewByName } from "../registry/index.js";

/* ---------------------------------------------------------------------------
 *  Eager‑import every possible HTML file so we can synchronously grab it later
 * ------------------------------------------------------------------------ */
const singlePages = import.meta.glob(
  "/src/content/viewContent/page/**/*.html",
  { import: "default", query: "?raw", eager: true }
);
const multiFragments = import.meta.glob(
  "/src/content/viewContent/fragments/**/*.html",
  { import: "default", query: "?raw", eager: true }
);

/* ---------------------------------------------------------------------------
 *  Local state
 * ------------------------------------------------------------------------ */
const compiledPages = {}; // view_name ➜ { renderHtml() }
let outlet = null; // the #content element
let firstPaint = false; // only reveal body once

/* ---------------------------------------------------------------------------
 *  helpers
 * ------------------------------------------------------------------------ */
function resolveHtml(glob, wantedPath) {
  const key = Object.keys(glob).find((k) => k.endsWith(wantedPath));
  if (!key) throw new Error(`[renderer] HTML not found for ${wantedPath}`);
  return glob[key];
}

/* ---------------------------------------------------------------------------
 *  renderPageByName
 * ------------------------------------------------------------------------ */
async function renderPageByName(viewName) {
  console.log(`[renderer] ▶ render "${viewName}"`);

  const meta = getViewByName(viewName);
  if (!meta) {
    outlet.innerHTML = `<h1>404 – Unknown view "${viewName}"</h1>`;
    return;
  }

  /* 1️⃣ before_scripts ---------------------------------------------------- */
  {
    const res = await Loader.runBeforeScripts(viewName);
    if (!res.ok) {
      outlet.innerHTML = `<div class="error">Failed to init view (before)</div>`;
      console.error("[renderer] before_scripts failed", res.error);
      return;
    }
  }

  /* 2️⃣ compile view (first time only) ----------------------------------- */
  if (!compiledPages[viewName]) {
    if (meta.view_type === "single") {
      const html = resolveHtml(singlePages, `/${meta.page}`);
      compiledPages[viewName] = { renderHtml: async () => html };
    } else if (meta.view_type === "multi") {
      const parts = (meta.fragments || []).map((f) =>
        resolveHtml(multiFragments, `/${f}`)
      );
      compiledPages[viewName] = { renderHtml: async () => parts.join("\n") };
    } else {
      throw new Error(`[renderer] bad view_type ${meta.view_type}`);
    }
  }

  /* 3️⃣ inject HTML ------------------------------------------------------- */
  outlet.innerHTML = await compiledPages[viewName].renderHtml();
  console.log(`[renderer] ✔ HTML injected for "${viewName}"`);

  /* 4️⃣ after_scripts ----------------------------------------------------- */
  const after = await Loader.runAfterScripts(viewName);
  if (!after.ok) {
    console.error("[renderer] after_scripts failed", after.error);
  } else {
    for (const tag of after.scripts) {
      const cached = getCached(tag);
      const mod = cached?.module ?? cached; // URL scripts cache raw promise
      if (mod && typeof mod.mount === "function") {
        console.log(`[renderer] 🚀 mount() "${tag}"`);
        try {
          await mod.mount();
        } catch (e) {
          console.error(`[renderer] mount() failed "${tag}"`, e);
        }
      }
    }
  }

  /* 5️⃣ first good paint – reveal body ----------------------------------- */
  if (!firstPaint) {
    document.body.style.visibility = "visible";
    firstPaint = true;
    console.log("[renderer] 🌟 body revealed (first paint)");
  }
}

/* ---------------------------------------------------------------------------
 *  Public setupRenderer – attach listener on #content
 * ------------------------------------------------------------------------ */
export function setupRenderer(contentEl) {
  if (!contentEl) throw new Error("[renderer] #content missing at setup");
  outlet = contentEl;

  outlet.addEventListener("render", (evt) => {
    const { page } = evt.detail || {};
    if (typeof page === "string") renderPageByName(page);
  });

  console.log("[renderer] 🪝 listener attached");
}
