import { initializePage } from "./initialize/index.js";
import { startPageChange } from "./pageChange.js";
import { setupRenderer } from "./renderer/index.js";
// Initialize the view registry
import { getViewRegistry } from "./registry/index.js";
import { Loader } from "./resourceLoader/index.js";

export function runSiteEngine() {
  const registry = getViewRegistry();
  Loader.init(registry);

  // Initialize creates the initial page content and then instantiates the delegated event listener for custom events.
  initializePage();
  // The element must be placed inside the #content container. It must include a
  // data-action attribute. To trigger an action, dispatch a do-action custom
  // event from that element. The event must bubble and include a type field in
  // the detail payload. Handlers can listen on the #content container and use
  // both data-action and detail.type to determine what behavior to execute. This
  // structure allows components to communicate without directly referencing each
  // other.

  // Get the content element where the page content will be rendered
  const content = document.getElementById("content");
  if (content) {
    setupRenderer(content);
    console.log("Renderer setup complete.");
  } else {
    error("[render] #content not found during setup");
  }

  startPageChange(); // registers events that signal when the content needs to change (aka router)

  console.log("pageMaker main()");
}
