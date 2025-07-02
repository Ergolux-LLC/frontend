console.log("[login.js] Loaded login module");

document.querySelector("form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username")?.value || "(blank)";
  const password = document.getElementById("password")?.value || "(blank)";
  console.log("[login.js] Form submitted");
  console.log(`[login.js] Email entered: "${email}"`);
  console.log(`[login.js] Password entered: "${"*".repeat(password.length)}"`);

  try {
    console.log("[login.js] Sending credentials to API...");

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      credentials: "include", // allow cookies to be set
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[login.js] Login failed:", err.message || res.statusText);
      alert(err.message || "Login failed");
      return;
    }

    const { user, tokens } = await res.json();
    console.log("[login.js] Authenticated user:", user);
    console.log(
      "[login.js] Access token (cookie set):",
      tokens?.access_token ? "✓" : "×"
    );

    // Optional: also store access token in localStorage if needed
    if (tokens?.access_token) {
      localStorage.setItem("ergolux_token", tokens.access_token);
    }

    // Remove login UI
    const container = document.getElementById("login-container");
    if (container) {
      container.remove();
      console.log("[login.js] Removed login container from DOM");
    } else {
      console.warn("[login.js] Login container not found during removal");
    }

    // Load main app logic
    console.log("[login.js] Importing main.js to initialize app");
    const app = await import("/src/main.js");
    if (app?.init) {
      console.log("[login.js] Calling app.init()");
      app.init(user); // pass user data if app.init handles it
    } else {
      console.warn("[login.js] main.js did not export an init() function");
    }
  } catch (err) {
    console.error("[login.js] Login error:", err);
    alert("Login failed: Network or server error");
  }
});
