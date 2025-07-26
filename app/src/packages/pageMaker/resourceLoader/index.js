/* src/packages/pageMaker/resourceLoader/index.js */

import { getScriptByTag } from "../registry/index.js";

const cache = new Map();
let registry = {};

const queue = { high: [], medium: [], low: [] };
const active = new Set();
let running = false;

export const hasCached = (k) => {
  const result = cache.has(k);
  console.log(`[Cache] hasCached(${k}) ➜ ${result}`);
  return result;
};

export const getCached = (k) => {
  const value = cache.get(k);
  console.log(`[Cache] getCached(${k}) ➜`, value);
  return value;
};

export const setCached = (k, v) => {
  cache.set(k, v);
  console.log(`[Cache] setCached(${k})`);
};

export const clear = () => {
  cache.clear();
  console.log(`[Cache] clear() called`);
};

function internalLoad(url) {
  console.log(`[Loader] internalLoad(${url})`);
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop().toLowerCase();

  if (ext === "js") {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => {
        console.log(`[Loader] JS loaded: ${url}`);
        resolve(s);
      };
      s.onerror = (e) => {
        console.error(`[Loader] JS load failed: ${url}`, e);
        reject(e);
      };
      document.head.appendChild(s);
    });
  }

  if (ext === "css") {
    return new Promise((resolve, reject) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = url;
      l.onload = () => {
        console.log(`[Loader] CSS loaded: ${url}`);
        resolve(l);
      };
      l.onerror = (e) => {
        console.error(`[Loader] CSS load failed: ${url}`, e);
        reject(e);
      };
      document.head.appendChild(l);
    });
  }

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return new Promise((resolve, reject) => {
      const i = new Image();
      i.src = url;
      i.onload = () => {
        console.log(`[Loader] Image loaded: ${url}`);
        resolve(i);
      };
      i.onerror = (e) => {
        console.error(`[Loader] Image load failed: ${url}`, e);
        reject(e);
      };
    });
  }

  return fetch(url)
    .then((r) => {
      console.log(`[Loader] fetch(${url}) ➜ status: ${r.status}`);
      if (!r.ok) throw new Error("Failed to load resource: " + r.status);
      return r;
    })
    .catch((err) => {
      console.error(`[Loader] Fetch failed: ${url}`, err);
      throw err;
    });
}

if (typeof global !== "undefined") global.__internalLoad = internalLoad;

function schedule(entry, prio) {
  const key =
    typeof entry === "string"
      ? entry
      : `${entry.type}:${entry.tag || entry.url}`;
  if (hasCached(key) || active.has(key)) {
    console.log(`[Queue] Skip scheduling ${key} (cached or active)`);
    return;
  }
  if (!["high", "medium", "low"].includes(prio)) {
    console.error(`[Queue] Invalid priority "${prio}"`);
    throw new Error(`[Loader] invalid priority "${prio}"`);
  }
  queue[prio].push(entry);
  active.add(key);
  console.log(`[Queue] Scheduled ${key} with priority ${prio}`);
}

async function runQueue() {
  if (running) {
    console.log("[Queue] runQueue() already running");
    return;
  }
  running = true;
  console.log("[Queue] runQueue() started");

  while (queue.high.length || queue.medium.length || queue.low.length) {
    for (const level of ["high", "medium", "low"]) {
      while (queue[level].length) {
        const entry = queue[level].shift();
        const key =
          typeof entry === "string"
            ? entry
            : `${entry.type}:${entry.tag || entry.url}`;
        active.delete(key);
        console.log(`[Queue] Processing ${key} from ${level}`);

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
          console.log(`[Queue] Loaded ${key}`);
        } catch (err) {
          console.error("[Queue] Failed loading:", entry, err);
        }
      }
    }
    await new Promise((r) => setTimeout(r, 0));
  }

  console.log("[Queue] runQueue() complete");
  running = false;
}

async function loadResourceForView(viewName) {
  console.log(`[Loader] loadResourceForView(${viewName})`);
  const list = registry[viewName];
  if (!Array.isArray(list)) throw new Error(`No list for view ${viewName}`);

  const promises = list.map((e) => {
    const k = typeof e === "string" ? e : `${e.type}:${e.tag || e.url}`;
    if (hasCached(k)) {
      console.log(`[Loader] Re-using cached ${k}`);
      return getCached(k);
    }

    let p;
    if (typeof e === "string") {
      p = internalLoad(e);
    } else if (e.type === "script") {
      const reg = getScriptByTag(e.tag);
      p =
        typeof reg?.module?.mount === "function"
          ? reg.module.mount()
          : Promise.resolve();
    } else {
      p = Promise.resolve();
    }

    setCached(k, p);
    return p;
  });

  return Promise.all(promises);
}

function _isUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

async function _loadScriptEntry(str, phase) {
  console.log(`[Loader] _loadScriptEntry(${str}, ${phase})`);
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
  console.log(`[Loader] runBeforeScripts(${view})`);
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
  console.log(`[Loader] runAfterScripts(${view})`);
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

async function loadView(viewName) {
  console.log(`[Loader] loadView(${viewName})`);
  if (!registry[viewName]) throw new Error(`Unknown view: ${viewName}`);

  const all = Object.keys(registry).filter((k) => k !== "views");
  const meta = registry.views.find((v) => v.view_name === viewName) || {};

  registry[viewName].forEach((e) => schedule(e, "high"));
  (meta.related_views || []).forEach((rel) => {
    (registry[rel] || []).forEach((e) => schedule(e, "medium"));
  });

  for (const v of all) {
    if (v === viewName) continue;
    if ((meta.related_views || []).includes(v)) continue;
    (registry[v] || []).forEach((e) => schedule(e, "low"));
  }

  return runQueue();
}

export const Loader = {
  init(reg) {
    console.log("[Loader] init() called");
    registry = reg;

    if (!Array.isArray(reg.views)) return;

    for (const view of reg.views) {
      const key = view.view_name;
      registry[key] = [];

      if (view.page) registry[key].push(view.page);
      if (Array.isArray(view.fragments)) {
        console.log(`[Loader] Fragments ignored for ${key}`);
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
    console.log(`[Loader] preload(${url})`);
    if (!hasCached(url)) schedule(url, "low");
  },

  getCached,
  handleExternalRequest({ viewName }) {
    console.log(`[Loader] handleExternalRequest(${viewName})`);
    return Loader.loadView(viewName);
  },

  loadResource: internalLoad,
  loadResourcesForView: loadResourceForView,
  runBeforeScripts,
  runAfterScripts,
};

export { schedule, runQueue, queue };
