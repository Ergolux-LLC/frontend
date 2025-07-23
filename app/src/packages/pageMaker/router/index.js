import { debug, info, warn, error } from "./logger.js";
import { renderBodyOnly } from "./renderer.js";

// Select the element where the content will be rendered
const element = document.getElementById("content");

if (!element) {
  error("[init] #content element not found during script initialization");
} else {
  debug("[init] #content element located successfully");
}

console.log("router/index.js initialized"); 

// --- When will the content change? ---

// 1. When the user clicks a link (intercepted)
document.addEventListener("click", (e) => {
  const anchor = e.target.closest("a");

  if (!anchor) return;

  if (
    anchor.href.startsWith(location.origin) &&
    !anchor.target &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey
  ) {
    e.preventDefault();
    info(`[event:click] Intercepted navigation to ${anchor.pathname}`);
    // navigate(anchor.pathname);
    info(
      `[event:click] (suppressed) Would have navigated to ${anchor.pathname}`
    );
  } else {
    debug(
      `[event:click] Ignored anchor click (external or modified click): href=${anchor.href}, target=${anchor.target}`
    );
  }
});

// 2. When the user presses the browser back/forward button
window.onpopstate = () => {
  info(`[event:popstate] (suppressed) Would render ${location.pathname}`);
  // render(location.pathname);
};

// 3. When the app first loads
info(
  `[event:initial-load] (suppressed) Would render current path: ${location.pathname}`
);
// render(location.pathname);

// 4. When navigate(path) is called manually
function navigate(path) {
  if (location.pathname !== path) {
    info(`[navigate] (suppressed) Would change history to ${path}`);
    // history.pushState({}, "", path);
  } else {
    debug(`[navigate] Path ${path} is already current, skipping pushState`);
  }

  // render(path);
  info(`[navigate] (suppressed) Would render path: ${path}`);
}

// Render content for a path
async function render(path) {
  const pageName = resolvePageName(path);
  debug(`[render] Resolved path "${path}" to page "${pageName}"`);

  try {
    debug(`[render] Attempting to render body only for "${pageName}"`);
    const html = await renderBodyOnly(pageName);

    if (!element) {
      error("[render] Cannot inject content: #content element is missing");
      return;
    }

    element.innerHTML = html;
    info(`[render] Content for "${pageName}" successfully injected`);
  } catch (err) {
    error(
      `[render] Failed to render page "${pageName}" for path "${path}"`,
      err
    );
    if (element) {
      element.innerHTML = `<div class="error">Failed to load page</div>`;
    }
  }
}

// Convert URL path to known view name
function resolvePageName(path) {
  debug(`[resolvePageName] Resolving path: ${path}`);

  switch (path) {
    case "/":
      debug(`[resolvePageName] "/" matched to "login"`);
      return "login";
    case "/crm":
      debug(`[resolvePageName] "/crm" matched to "crm"`);
      return "crm";
    default:
      warn(`[resolvePageName] Unknown path "${path}" — defaulting to "login"`);
      return "login";
  }
}
