import { resourceLoader } from "./loader/resourceLoader.js";
import { getNavFragment } from "./ui/fragments/navbar/nav.js";
import { getFooterFragment } from "./ui/fragments/footer/footer.js";
console.log("[main] starting app initialization");
// --- ROUTE MAP ---
const routes = {
  "/": () => import("./pages/login.js").then((m) => m.render),
  "/dashboard": () => import("./pages/dashboard.js").then((m) => m.render),
};

// --- NAVIGATION ---
function navigate(path) {
  console.log(`[navigate] to: ${path}`);
  if (location.pathname !== path) {
    history.pushState({}, "", path);
  }
  render(path);
}

window.onpopstate = () => {
  console.log(`[popstate] current path: ${location.pathname}`);
  render(location.pathname);
};

// --- MAIN RENDER FUNCTION ---
async function render(path) {
  console.group(`[render] BEGIN path=${path}`);
  document.body.style.visibility = "hidden";

  const logicalPage = path === "/" ? "login" : "dashboard";
  console.log(`[render] logicalPage: ${logicalPage}`);

  await loadPageAssets(logicalPage);
  buildStaticLayout();

  await renderRoute(path, navigate);

  resourceLoader.preloadNextPossibleResources(logicalPage);

  document.body.style.visibility = "visible";
  console.log("[render] complete");
  console.groupEnd();
}

// --- LOAD PAGE STYLES/SCRIPTS ---
async function loadPageAssets(page) {
  try {
    console.log("[assets] loading...");
    await resourceLoader.loadPageResources(page);
    console.log("[assets] loaded");
  } catch (err) {
    console.error("[assets] failed to load:", err);
  }
}

// --- BUILD STATIC NAV/MAIN/FOOTER ---
function buildStaticLayout() {
  try {
    console.log("[layout] building static layout");

    const contentRoot = document.getElementById("content");
    if (!contentRoot) {
      console.error("[layout] #content element not found");
      return;
    }

    contentRoot.innerHTML = "";

    const isLoginPage = location.pathname === "/";

    if (!isLoginPage) {
      const nav = getNavFragment();
      if (nav) contentRoot.appendChild(nav);
    }

    const main = document.createElement("main");
    main.id = "main";
    contentRoot.appendChild(main);

    if (!isLoginPage) {
      const footer = getFooterFragment();
      if (footer) contentRoot.appendChild(footer);
    }

    console.log("[layout] layout constructed");
  } catch (err) {
    console.error("[layout] error constructing layout:", err);
  }
}

// --- IMPORT ROUTE AND RENDER ---
async function renderRoute(path, navigate) {
  try {
    console.log("[route] importing module...");
    const route = routes[path] || routes["/"];
    const renderFn = await route();
    console.log("[route] rendering...");
    await renderFn({ navigate });
  } catch (err) {
    console.error("[route] failed:", err);
  }
}

// Twilio

import "./components/twilio_client/twilio.js";

// --- INIT ---
console.log("[main] initial render");
render(location.pathname);
