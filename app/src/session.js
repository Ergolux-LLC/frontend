// /src/session.js
import { init as initApp } from "/src/main.js";

export async function checkSession() {
  try {
    const res = await fetch("http://localhost:8000/auth/session", {
      credentials: "include",
    });

    if (res.ok) {
      const { user } = await res.json();
      console.log("[session.js] Valid session:", user);

      document.getElementById("login-container")?.remove();
      initApp(user);
      return true;
    }

    console.log("[session.js] No valid session found");
    return false;
  } catch (err) {
    console.error("[session.js] Session check failed:", err);
    return false;
  }
}
