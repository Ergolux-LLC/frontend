// src/ui/render.js

import { getNavFragment } from "./fragments/navbar/nav.js";
import { getFooterFragment } from "./fragments/footer/footer.js";
import { getContentFragment } from "./fragments/content/dashboardContent.js";

export function render() {
  console.log("[render] assembling layout");

  const container = document.getElementById("content");
  if (!container) {
    console.error("[render] #content not found");
    return;
  }

  container.innerHTML = "";
  container.style.visibility = "hidden";

  const nav = getNavFragment();
  const main = getContentFragment();
  const footer = getFooterFragment();

  if (nav) container.appendChild(nav);
  if (main) container.appendChild(main);
  if (footer) container.appendChild(footer);

  requestAnimationFrame(() => {
    container.style.visibility = "visible";
    console.log("[render] layout rendered");
  });
}
