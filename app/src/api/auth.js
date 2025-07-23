// Local override for mock mode
const FORCE_LIVE_LOGIN = true; // true = always hit server, even in dev

export async function login({ email, password }) {
  console.log(`[login] Attempting login for: ${email}`);

  const isDev = import.meta.env.MODE === "development";
  if (isDev && !FORCE_LIVE_LOGIN) {
    console.log("[login] Development mode detected. Returning mock response.");
    return {
      user: { id: "dev-user-123", email, name: "Dev User", role: "admin" },
      tokens: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    };
  }

  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("password", password);

  try {
    const res = await fetch("http://app.ergolux.io.localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      credentials: "include", // send + receive cookies
    });

    // ── log everything we can see from the response ──────────────────────────
    console.log(`[login] HTTP status: ${res.status} ${res.statusText}`);

    console.log("[login] Response headers:");
    res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));

    // Set‑Cookie is HttpOnly → not readable, but log what the browser can see
    console.log("[login] document.cookie (visible cookies):", document.cookie);

    if (!res.ok) {
      let errText = "Login failed";
      try {
        const errBody = await res.clone().json();
        errText = errBody.detail || errBody.message || errText;
        console.log("[login] Error body:", errBody);
      } catch {
        console.warn("[login] Error body not JSON");
        errText = await res.text();
      }
      console.error(`[login] Login failed for ${email}: ${errText}`);
      throw new Error(errText);
    }

    const result = await res.json();
    console.log("[login] Response body:", result);
    console.log(`[login] Login successful for ${email}`);

    return result;
  } catch (err) {
    console.error(`[login] Exception during login: ${err.message}`);
    throw err;
  }
}
