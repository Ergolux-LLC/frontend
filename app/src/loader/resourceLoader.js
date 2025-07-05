const resourceManifest = {
  login: {
    styles: [],
    scripts: [], // login.js is imported via ES module in main.js
  },
  dashboard: {
    styles: [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    ],
    scripts: [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
    ],
  },
};

function loadStyles(styles) {
  console.log("[loader] loading styles:", styles.length);
  return Promise.all(
    styles.map((href) => {
      return new Promise((resolve) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href + "?v=" + Math.random();
        link.onload = () => {
          console.log(`[loader] loaded style: ${link.href}`);
          resolve();
        };
        link.onerror = (err) => {
          console.error(`[loader] failed to load style: ${link.href}`, err);
          resolve(); // avoid blocking
        };
        document.head.appendChild(link);
      });
    })
  );
}

function loadScripts(scripts) {
  console.log("[loader] loading scripts:", scripts.length);
  return Promise.all(
    scripts.map((src) => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => {
          console.log(`[loader] loaded script: ${script.src}`);
          resolve();
        };
        script.onerror = (err) => {
          console.error(`[loader] failed to load script: ${script.src}`, err);
          resolve(); // avoid blocking
        };
        document.body.appendChild(script);
      });
    })
  );
}

function preloadScripts(scripts) {
  console.log("[loader] preloading scripts:", scripts.length);
  scripts.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = src;
    document.head.appendChild(link);
  });
}

function preloadStyles(styles) {
  console.log("[loader] preloading styles:", styles.length);
  styles.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
}

function loadPageResources(page) {
  console.log(`[loader] loadPageResources for: ${page}`);
  const { styles, scripts } = resourceManifest[page];
  return loadStyles(styles).then(() => loadScripts(scripts));
}

function preloadNextPossibleResources(currentPage) {
  console.log(
    `[loader] preloadNextPossibleResources (excluding: ${currentPage})`
  );
  Object.keys(resourceManifest).forEach((page) => {
    if (page !== currentPage) {
      preloadStyles(resourceManifest[page].styles);
      preloadScripts(resourceManifest[page].scripts);
    }
  });
}

function hasValidToken() {
  const valid =
    localStorage.getItem("access_token") &&
    localStorage.getItem("refresh_token");
  console.log(`[loader] hasValidToken = ${!!valid}`);
  return valid;
}

const resourceLoader = {
  getInitialPage() {
    const page = hasValidToken() ? "dashboard" : "login";
    console.log(`[loader] getInitialPage = ${page}`);
    return page;
  },
  loadPageResources,
  preloadNextPossibleResources,
};

export { resourceLoader };
