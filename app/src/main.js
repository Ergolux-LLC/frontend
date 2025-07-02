import "./components/dynamic_content/nav-content.js";
import "./components/dynamic_content/main-content.js";
import "./components/twilio_client/twilio.js";

console.log("[main.js] Module loaded");

async function checkSession() {
  console.log("[main.js] Checking for existing session via /auth/me");

  try {
    const res = await fetch("http://localhost:8000/auth/me", {
      method: "GET",
      credentials: "include",
    });

    console.log("[main.js] /auth/me response status:", res.status);

    if (!res.ok) {
      console.warn("[main.js] Session check failed with status:", res.status);
      throw new Error("No valid session");
    }

    const { user } = await res.json();
    console.log("[main.js] Authenticated session confirmed. User:", user);

    const loginContainer = document.getElementById("login-container");
    if (loginContainer) {
      loginContainer.remove();
      console.log("[main.js] Removed login container from DOM");
    } else {
      console.log("[main.js] No login container found to remove");
    }

    init(user);
  } catch (err) {
    console.warn("[main.js] No valid session detected. User must log in.");
  }
}

checkSession();

export function init(user) {
  console.log("[main.js] Running init()", user);

  document.body.innerHTML = `
    <nav-content></nav-content>
    <main-content></main-content>
    <footer id="main-footer" class="text-center text-muted small mt-4 py-2 border-top"></footer>
    <twilio-widget></twilio-widget>
  `;

  console.log("[main.js] DOM structure injected");

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-page]");
    if (!target) return;

    e.preventDefault();
    const page = target.dataset.page;
    const main = document.querySelector("main-content");

    if (main) {
      console.log(`[main.js] Setting page to "${page}"`);
      main.page = page;
    } else {
      console.warn("[main.js] <main-content> not found");
    }
  });

  console.log("[main.js] Navigation listeners attached");
}
