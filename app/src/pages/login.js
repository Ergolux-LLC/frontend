import { getContentFragment } from "../ui/fragments/content/loginContent.js";
import { login } from "../api/auth.js";

export async function render({ navigate }) {
  console.log("[login] rendering");

  const main = getContentFragment();

  if (!main) {
    console.error("[login] failed to generate main content");
    return;
  }

  const form = main.querySelector("#loginForm");
  const usernameInput = main.querySelector("#username");
  const passwordInput = main.querySelector("#password");

  if (!form || !usernameInput || !passwordInput) {
    console.error("[login] Form or input elements not found in DOM");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      console.log("[login] submitting credentials");
      console.log("[login] Email entered:", email);
      console.log("[login] Password entered:", "*".repeat(password.length));

      const response = await login({ email, password });

      console.log("[login] Full API response:", response);
      console.log("[login] Authenticated user:", response.user);
      console.log("[login] Tokens:", response.tokens);

      navigate("/dashboard");

      // TEMP: Debug token from cookie
      fetch("/api/storage/token-debug", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("[debug] token debug response:", data);
          console.log("[debug] token name:", data.name);
        })

        .catch((err) =>
          console.error("[debug] token debug request failed:", err)
        );
    } catch (err) {
      console.error("[login] Login failed:", err);
      alert(err.message);
    }
  });

  const container = document.getElementById("content");
  if (!container) {
    console.error("[login] #content not found");
    return;
  }

  container.innerHTML = "";
  container.style.visibility = "hidden";
  container.appendChild(main);

  requestAnimationFrame(() => {
    container.style.visibility = "visible";
    console.log("[login] content rendered");
  });
}
