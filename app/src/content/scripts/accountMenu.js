// src/content/scripts/account_nav.js
// -----------------------------------------------------------------------------
//  Simple dropdown navigation for the account menu.
//
//  • Attaches a click listener to every  <a.dropdown-item data-page="…">
//    inside the nav bar whenever the view is mounted.
//  • Pushes the correct path into history, then fires PopState so the SPA
//    router redraws.
//  • Adds copious logging so we can see every decision.
//  • Works regardless of Bootstrap’s own event handling because we bind
//    directly on the <a> elements.
//
//  REQUIRED BY YAML:   after_scripts: [ …, "account_nav_script" ]
// -----------------------------------------------------------------------------

export const scriptTag = "account_nav_script";

let bound = false; // prevent double‑binding across hot reloads

export function mount() {
  if (bound) {
    console.log("[account_nav] already mounted — skipping");
    return;
  }

  const navbar = document.querySelector("nav.navbar");
  if (!navbar) {
    console.warn(
      "[account_nav] ⚠️ navbar not found — no dropdown items to bind"
    );
    return;
  }

  console.log("[account_nav] 🔍 scanning for dropdown items…");

  // Fresh‑clone all target anchors so previous listeners are wiped
  navbar.querySelectorAll("a.dropdown-item[data-page]").forEach((a) => {
    a.replaceWith(a.cloneNode(true));
  });

  const anchors = navbar.querySelectorAll("a.dropdown-item[data-page]");
  anchors.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const page = a.dataset.page;
      const targetPath = `/${page}`;

      console.log(
        `[account_nav] ⛳ click → "${targetPath}"  text="${a.textContent.trim()}"`
      );

      // Close the dropdown for immediate feedback
      const menu = a.closest(".dropdown-menu");
      if (menu) menu.classList.remove("show");

      try {
        history.pushState({}, "", targetPath);
        window.dispatchEvent(new PopStateEvent("popstate"));
        console.log("[account_nav] ✅ SPA navigation dispatched");
      } catch (err) {
        console.error(
          "[account_nav] 🛑 pushState failed, doing full redirect",
          err
        );
        window.location.assign(targetPath);
      }
    });
  });

  console.log(`[account_nav] 🎉 handlers bound to ${anchors.length} item(s)`);
  bound = true;
}

export function dismount() {
  // no‑op: elements are replaced on the next mount, which automatically
  // removes any prior listeners
  bound = false;
}
