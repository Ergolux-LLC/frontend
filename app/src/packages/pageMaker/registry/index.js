// src/registry/index.js
// -----------------------------------------------------------------------------
// Loads views.yaml, registers script modules, and exposes helper functions.
// Now understands the `requires_auth` flag and no longer assumes a “_view”
// suffix. Nothing else in the app has to change.
// -----------------------------------------------------------------------------

import { parse } from "yaml";
import rawYaml from "@views/views.yaml?raw";

// ────────────────────────────────────────────────────────────────────────────
// Parse YAML
// ────────────────────────────────────────────────────────────────────────────
console.log("🔍 Parsing view registry YAML…");
let viewRegistry;
try {
  viewRegistry = parse(rawYaml);
  console.log("✅ YAML parsed successfully.");
} catch (err) {
  console.error("❌ Failed to parse views.yaml:", err);
  throw err;
}

if (!Array.isArray(viewRegistry.views)) {
  console.error("❌ Invalid views.yaml: missing or malformed 'views' key.");
  throw new Error("Invalid views.yaml: missing or malformed 'views' key.");
}

// coerce requires_auth to a boolean (default false)
viewRegistry.views = viewRegistry.views.map((v) => ({
  ...v,
  requires_auth: Boolean(v.requires_auth),
}));

console.log("✅ View registry loaded with", viewRegistry.views.length, "views");
console.debug("🔍 Full view registry object:", viewRegistry);

// ────────────────────────────────────────────────────────────────────────────
// Script registry  (eager import of /content/scripts/*.js)
// ────────────────────────────────────────────────────────────────────────────
console.log("🔍 Scanning for script modules in /content/scripts…");
const modules = import.meta.glob("../../../content/scripts/*.js", {
  eager: true,
});

const scriptRegistry = {};
for (const path in modules) {
  const mod = modules[path];
  if (!mod.scriptTag) {
    console.warn(`⚠️ Skipping module ${path}: missing 'scriptTag' export`);
    continue;
  }

  const tag = mod.scriptTag.toLowerCase();
  if (scriptRegistry[tag]) {
    console.warn(`⚠️ Duplicate scriptTag "${tag}" detected. Overwriting.`);
  }
  scriptRegistry[tag] = { module: mod, path };
}
console.log(
  `✅ Script registry initialized with ${
    Object.keys(scriptRegistry).length
  } scripts.`
);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
export function getScriptByTag(tag) {
  const key = tag.toLowerCase();
  const entry = scriptRegistry[key];
  if (!entry) console.warn(`⚠️ Script not found for tag "${tag}"`);
  return entry;
}

export function getAllScriptTags() {
  return Object.keys(scriptRegistry);
}

export function getViewByName(viewName) {
  const view = viewRegistry.views.find((v) => v.view_name === viewName);
  if (!view) console.warn(`⚠️ View not found for name "${viewName}"`);
  return view;
}

export function requiresAuth(viewName) {
  const v = getViewByName(viewName);
  return v?.requires_auth === true;
}

export function getViewRegistry() {
  return viewRegistry;
}
