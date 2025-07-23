import { login } from "@api/auth";

export const scriptTag = "login_script";

console.log("[login.js] ⏱ module loaded");

/* helpers --------------------------------------------------------------- */
const showErr = (id, msg) => {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.visibility = "visible";
  }
};
const hideErr = (id) => {
  const el = document.getElementById(id);
  if (el) el.style.visibility = "hidden";
};
const clearErrors = () => {
  hideErr("usernameErr");
  hideErr("passwordErr");
};
const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

/* main login flow ------------------------------------------------------- */
async function handleLogin() {
  clearErrors();

  const emailInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  if (!emailInput || !passwordInput) {
    console.error("[login.js] input elements missing");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasError = false;
  if (!isEmail(email)) {
    showErr("usernameErr", "Enter a valid e‑mail address");
    hasError = true;
  }
  if (!password) {
    showErr("passwordErr", "Password is required");
    hasError = true;
  }
  if (hasError) return;

  try {
    const { user } = await login({ email, password });
    console.log("[login.js] ✅ authenticated:", user);

    document.getElementById("login-container")?.remove();

    /* go directly to dashboard */
    history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch (err) {
    console.error("[login.js] 🛑 API error:", err.message);
    showErr("passwordErr", err.message || "Login failed");
  }
}

/* mount / dismount ------------------------------------------------------ */
let handler = null;
let loginBtn = null;

export async function mount() {
  console.log("[login.js] 🔧 mount()");

  /* demo system‑status banner (placeholder) */
  const statusBar = document.getElementById("statusBar");
  if (statusBar) {
    statusBar.textContent =
      "Maintenance window tonight 02:00‑03:00 UTC – expect brief downtime.";
    statusBar.style.visibility = "visible";
  }

  loginBtn = document.querySelector('[data-action="login"]');
  if (loginBtn) {
    handler = (e) => {
      e.preventDefault();
      handleLogin();
    };
    loginBtn.addEventListener("click", handler);
    console.log("[login.js] click handler attached");
  } else {
    console.warn('[login.js] button [data-action="login"] not found');
  }
}

export function dismount() {
  console.log("[login.js] 📴 dismount()");
  if (loginBtn && handler) loginBtn.removeEventListener("click", handler);
  handler = null;
  loginBtn = null;
}
