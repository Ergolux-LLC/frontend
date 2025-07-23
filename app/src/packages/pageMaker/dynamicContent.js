// preload all HTML files
const singlePages = import.meta.glob("./pages/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

const partials = import.meta.glob("./partials/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

// preload all page scripts
const scripts = import.meta.glob("./scripts/*.js");

function getTemplate(map, dir, name) {
  const key = `./${dir}/${name}.html`;
  const content = map[key];
  if (!content) throw new Error(`Template not found: ${key}`);
  return content;
}

class BaseHtmlPage {
  constructor(scriptName = null) {
    this.head = {
      meta: [],
      scripts: {
        requiresJquery: false,
        requiresBootstrap: false,
        requiresCustomScripts: [],
      },
      stylesheets: [],
    };
    this.scriptName = scriptName; // optional page-level script (without extension)
  }

  async runScriptIfNeeded() {
    if (!this.scriptName) return;
    const key = `./scripts/${this.scriptName}.js`;
    const loader = scripts[key];
    if (typeof loader === "function") {
      await loader();
    } else {
      console.warn(`[BaseHtmlPage] Script not found: ${key}`);
    }
  }

  renderHtml() {
    throw new Error("renderHtml() must be implemented by subclass");
  }
}

class SinglePageHtml extends BaseHtmlPage {
  constructor(fileName, scriptName = null) {
    if (!fileName) throw new Error("SinglePageHtml requires a fileName");
    super(scriptName);
    this.mode = "single";
    this.body = {
      singlePageHtml: "",
    };
    this.fileName = fileName;
  }

  async init() {
    this.body.singlePageHtml = getTemplate(singlePages, "pages", this.fileName);
    await this.runScriptIfNeeded();
    return this;
  }

  renderHtml() {
    return `
  ${this.body.singlePageHtml}
    `.trim();
  }
}

class MultiSegmentHtml extends BaseHtmlPage {
  constructor({ navigation, content, footer, scriptName = null }) {
    if (!navigation || !content || !footer) {
      throw new Error(
        "MultiSegmentHtml requires navigation, content, and footer filenames"
      );
    }
    super(scriptName);
    this.mode = "multi";
    this.paths = { navigation, content, footer };
    this.body = {
      multiSegment: {
        navigation: "",
        content: "",
        footer: "",
      },
    };
  }

  async init() {
    this.body.multiSegment.navigation = getTemplate(
      partials,
      "partials",
      this.paths.navigation
    );
    this.body.multiSegment.content = getTemplate(
      partials,
      "partials",
      this.paths.content
    );
    this.body.multiSegment.footer = getTemplate(
      partials,
      "partials",
      this.paths.footer
    );
    await this.runScriptIfNeeded();
    return this;
  }

  renderHtml() {
    const { navigation, content, footer } = this.body.multiSegment;
    return `
  ${navigation}
  ${content}
  ${footer}
    `.trim();
  }
}

export { SinglePageHtml, MultiSegmentHtml };
