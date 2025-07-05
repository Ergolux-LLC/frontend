// src/pages/dashboard.js

import { getNavFragment } from "../ui/fragments/navbar/nav.js";
import { getFooterFragment } from "../ui/fragments/footer/footer.js";
import { getContentFragment } from "../ui/fragments/content/dashboardContent.js";

export async function render({ navigate }) {
  console.log("[dashboard] render start");

  const nav = getNavFragment();
  const main = getContentFragment();
  const footer = getFooterFragment();

  if (!main) {
    console.error("[dashboard] failed to generate dashboard content");
    return;
  }

  const homeBtn = main.querySelector("#gotoHome");
  if (homeBtn) {
    console.log("[dashboard] #gotoHome found, binding click");
    homeBtn.addEventListener("click", () => {
      console.log("[dashboard] navigating to /");
      navigate("/");
    });
  } else {
    console.warn("[dashboard] #gotoHome not found in content");
  }

  const container = document.getElementById("content");
  if (!container) {
    console.error("[dashboard] #content not found");
    return;
  }

  container.innerHTML = "";
  container.style.visibility = "hidden";

  if (nav) container.appendChild(nav);
  container.appendChild(main);
  if (footer) container.appendChild(footer);

  requestAnimationFrame(() => {
    container.style.visibility = "visible";
    console.log("[dashboard] content rendered");
  });
}
