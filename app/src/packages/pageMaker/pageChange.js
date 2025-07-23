// src/pageChange.js
import { getViewByName } from "./registry/index.js";

export function startPageChange() {
  const currentPath = location.pathname;
  console.log(`[router] boot → currentPath="${currentPath}"`);

  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    const hasPage = Boolean(anchor.dataset.page);

    // Ignore Bootstrap dropdown toggles and dummy hashes
    if (href === "#" || anchor.hasAttribute("data-bs-toggle")) {
      console.log(
        `[router] ignore link (dropdown/href=#) href="${href}" text="${anchor.textContent.trim()}"`
      );
      e.preventDefault();
      return;
    }

    if (
      hasPage &&
      anchor.href.startsWith(location.origin) &&
      !anchor.target &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      const targetPath = `/${anchor.dataset.page}`;
      console.log(
        `[router] nav click → targetPath="${targetPath}" text="${anchor.textContent.trim()}"`
      );
      navigate(targetPath);
    } else if (anchor.href.startsWith(location.origin)) {
      console.warn(
        `[router] unhandled same‑origin link (no data-page) → "${href}" — defaulting to full reload`
      );
    }
  });

  window.onpopstate = () => {
    console.log(`[router] popstate "${location.pathname}"`);
    emitPageRender(location.pathname);
  };

  emitPageRender(currentPath);
}

function navigate(path) {
  if (location.pathname !== path) {
    history.pushState({}, "", path);
    console.log(`[router] history.pushState → "${path}"`);
  }
  emitPageRender(path);
}

async function emitPageRender(path) {
  console.log(`[router] render request for "${path}"`);
  const content = document.getElementById("content");
  if (!content) {
    console.error("[router] #content not found");
    return;
  }

  const view = resolveViewFromPath(path);
  if (!view) {
    console.error(`[router] no view for "${path}"`);
    return;
  }

  if (!(await ensureAuth(view))) {
    console.warn(`[router] auth required; redirecting to /login`);
    navigate("/login");
    return;
  }

  content.dispatchEvent(
    new CustomEvent("render", {
      bubbles: true,
      detail: { page: view.view_name, path, view },
    })
  );
}

function resolveViewFromPath(path) {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const candidates = clean === "" ? ["login"] : [clean, `${clean}_view`];

  for (const name of candidates) {
    const v = getViewByName(name);
    if (v) return v;
  }
  console.warn(`[router] no candidate matched "${path}", using not_found`);
  return getViewByName("not_found");
}

async function ensureAuth(viewMeta) {
  if (!viewMeta?.requires_auth) return true;
  try {
    const res = await fetch("/api/auth/validate", { credentials: "include" });
    console.log(`[router] auth check → ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error("[router] auth check failed:", err);
    return false;
  }
}
