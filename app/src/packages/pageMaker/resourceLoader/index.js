/* src/packages/pageMaker/resourceLoader/index.js
 *
 * Centralized resource loader for SPA runtime.
 *
 * Key points
 * ----------
 * • One named export:  import { Loader } from "./resourceLoader/index.js";
 * • Understands  <scriptTag>  OR  full https:// URLs  in before/after scripts
 * • Supports speculative preload queues and CDN assets (Bootstrap, etc.)
 */

import { getScriptByTag } from "../registry/index.js";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Internal State                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

const cache = new Map(); // key ➜ resolved value | Promise
let registry = {}; // merged YAML + flattened entries

const queue = { high: [], medium: [], low: [] };
const active = new Set(); // de‑dupe scheduled keys
let running = false; // runQueue re‑entrancy guard

/* ────────────────────────────────────────────────────────────────────────── */
/*  Cache helpers                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export const hasCached = (k) => cache.has(k);
export const getCached = (k) => cache.get(k);
export const setCached = (k, v) => cache.set(k, v);
export const clear = () => cache.clear();

/* ────────────────────────────────────────────────────────────────────────── */
/*  Primitive loader for arbitrary URLs                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function internalLoad(url) {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop().toLowerCase();

  /* JS ––– */
  if (ext === "js") {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => resolve(s);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* CSS ––– */
  if (ext === "css") {
    return new Promise((resolve, reject) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = url;
      l.onload = () => resolve(l);
      l.onerror = reject;
      document.head.appendChild(l);
    });
  }

  /* images ––– */
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.src = url;
      i.onload = () => resolve(i);
      i.onerror = reject;
    });
  }

  /* video or fall‑back fetch ––– */
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load resource: " + r.status);
    return r;
  });
}

/* expose for dev‑console tinkering */
if (typeof global !== "undefined") global.__internalLoad = internalLoad;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Priority queue                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function schedule(entry, prio) {
  const key =
    typeof entry === "string"
      ? entry
      : `${entry.type}:${entry.tag || entry.url}`;

  if (hasCached(key) || active.has(key)) return;
  if (!["high", "medium", "low"].includes(prio))
    throw new Error(`[Loader] invalid priority "${prio}"`);

  queue[prio].push(entry);
  active.add(key);
}

async function runQueue() {
  if (running) return;
  running = true;

  while (queue.high.length || queue.medium.length || queue.low.length) {
    for (const level of ["high", "medium", "low"]) {
      while (queue[level].length) {
        const entry = queue[level].shift();
        const key =
          typeof entry === "string"
            ? entry
            : `${entry.type}:${entry.tag || entry.url}`;
        active.delete(key);

        try {
          let p;
          if (typeof entry === "string") {
            p = internalLoad(entry);
          } else if (entry.type === "script") {
            const reg = getScriptByTag(entry.tag);
            if (!reg) throw new Error(`Script not found: ${entry.tag}`);
            p =
              typeof reg.module?.mount === "function"
                ? reg.module.mount()
                : Promise.resolve();
          } else {
            throw new Error(`Unknown entry type: ${entry.type}`);
          }
          setCached(key, p);
          await p;
        } catch (err) {
          console.error("[Loader] failed:", entry, err);
        }
      }
    }
    await new Promise((r) => setTimeout(r, 0));
  }

  running = false;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  View‑scoped resource loader                                             */
/* ────────────────────────────────────────────────────────────────────────── */

async function loadResourceForView(viewName) {
  const list = registry[viewName];
  if (!Array.isArray(list)) throw new Error(`No list for view ${viewName}`);

  const promises = list.map((e) => {
    const k = typeof e === "string" ? e : `${e.type}:${e.tag || e.url}`;
    if (hasCached(k)) return getCached(k);

    let p;
    if (typeof e === "string") p = internalLoad(e);
    else if (e.type === "script") {
      const reg = getScriptByTag(e.tag);
      p =
        typeof reg?.module?.mount === "function"
          ? reg.module.mount()
          : Promise.resolve();
    } else p = Promise.resolve();

    setCached(k, p);
    return p;
  });

  return Promise.all(promises);
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Before / after scripts helpers                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function _isUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

async function _loadScriptEntry(str, phase) {
  if (typeof str !== "string")
    throw new Error(`[Loader] ${phase}: entry must be string`);

  if (_isUrl(str)) {
    const p = internalLoad(str);
    setCached(str, p);
    await p;
    return str;
  }

  const reg = getScriptByTag(str);
  if (reg) {
    setCached(str, reg);
    return str;
  }

  throw new Error(`[Loader] ${phase}: Unknown scriptTag "${str}"`);
}

async function runBeforeScripts(view) {
  const meta = registry.views.find((v) => v.view_name === view);
  if (!meta?.before_scripts?.length) return { ok: true, scripts: [] };

  const loaded = [];
  for (const e of meta.before_scripts) {
    try {
      loaded.push(await _loadScriptEntry(e, "before_script"));
    } catch (err) {
      console.error(err);
      return { ok: false, error: err.message };
    }
  }
  return { ok: true, scripts: loaded };
}

async function runAfterScripts(view) {
  const meta = registry.views.find((v) => v.view_name === view);
  if (!meta?.after_scripts?.length) return { ok: true, scripts: [] };

  const loaded = [];
  for (const e of meta.after_scripts) {
    try {
      loaded.push(await _loadScriptEntry(e, "after_script"));
    } catch (err) {
      console.error(err);
      return { ok: false, error: err.message };
    }
  }
  return { ok: true, scripts: loaded };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main view‑loader orchestration                                          */
/* ────────────────────────────────────────────────────────────────────────── */

async function loadView(viewName) {
  if (!registry[viewName]) throw new Error(`Unknown view: ${viewName}`);

  const all = Object.keys(registry).filter((k) => k !== "views");
  const meta = registry.views.find((v) => v.view_name === viewName) || {};

  // current (high)
  registry[viewName].forEach((e) => schedule(e, "high"));

  // related (medium)
  (meta.related_views || []).forEach((rel) => {
    (registry[rel] || []).forEach((e) => schedule(e, "medium"));
  });

  // everything else (low)
  for (const v of all) {
    if (v === viewName) continue;
    if ((meta.related_views || []).includes(v)) continue;
    (registry[v] || []).forEach((e) => schedule(e, "low"));
  }

  return runQueue();
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Registry Initializer                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export const Loader = {
  init(reg) {
    registry = reg;

    if (!Array.isArray(reg.views)) return;

    for (const view of reg.views) {
      const key = view.view_name;
      registry[key] = [];

      if (view.page) registry[key].push(view.page);
      if (Array.isArray(view.fragments)) {
        /* renderer fetches fragments */
      }

      const pushTagOrUrl = (arr) => {
        for (const s of arr) {
          if (_isUrl(s)) registry[key].push(s);
          else registry[key].push({ type: "script", tag: s });
        }
      };

      if (Array.isArray(view.before_scripts)) pushTagOrUrl(view.before_scripts);
      if (Array.isArray(view.after_scripts)) pushTagOrUrl(view.after_scripts);

      if (view.preload) {
        ["styles", "images", "fonts", "videos"].forEach((t) => {
          if (Array.isArray(view.preload[t])) {
            registry[key].push(...view.preload[t]);
          }
        });
      }
    }

    console.log("[Loader] registry flattened", registry);
  },

  loadView,
  preload(url) {
    if (!hasCached(url)) schedule(url, "low");
  },

  getCached,
  handleExternalRequest({ viewName }) {
    return Loader.loadView(viewName);
  },

  /* public helpers */
  loadResource: internalLoad,
  loadResourcesForView: loadResourceForView,
  runBeforeScripts,
  runAfterScripts,
};

/* named re‑exports for tests / debugging */
export { schedule, runQueue, queue };
