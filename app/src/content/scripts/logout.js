// content/scripts/logout.js
// -----------------------------------------------------------------------------
// Handles the Logout link in the navbar.
//
// • Sends POST /api/auth/logout (cookies included)
// • Clears local & session storage
// • Redirects to “/”  (root login page)
// • Adds detailed logging so you can see every step
// -----------------------------------------------------------------------------

export const scriptTag = "logout_script";

let handler; // pointer to the bound click handler
let bound = false; // guard against double‑binding

async function doLogout() {
  console.log("[logout] 🚪 user clicked — initiating logout");

  /* 1. hit the backend */
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    console.log(`[logout] ↩ server responded ${res.status} ${res.statusText}`);

    // best‑effort peek at body
    try {
      const body = await res.clone().json();
      console.log("[logout] response JSON:", body);
    } catch {
      const text = await res.text();
      console.log("[logout] response text:", text);
    }
  } catch (err) {
    console.error("[logout] network / CORS error:", err);
  }

  /* 2. wipe any client‑side artifacts */
  localStorage.clear();
  sessionStorage.clear();
  console.log("[logout] 🧹 local & session storage cleared");

  /* 3. hard‑navigate to root (/) which shows the login screen */
  try {
    history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    console.log('[logout] 🔄 SPA route to "/" dispatched');
  } catch (err) {
    console.warn("[logout] pushState failed, doing full reload", err);
    window.location.assign("/");
  }
}

export function mount() {
  if (bound) return;

  const link = document.getElementById("logoutLink");
  if (!link) {
    console.warn("[logout] ⚠️ #logoutLink not found — nothing to bind");
    return;
  }

  handler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    doLogout();
  };

  link.addEventListener("click", handler);
  bound = true;
  console.log("[logout] ✅ listener attached");
}

export function dismount() {
  if (!bound) return;
  const link = document.getElementById("logoutLink");
  if (link && handler) link.removeEventListener("click", handler);
  bound = false;
  handler = null;
  console.log("[logout] ❎ listener removed");
}
