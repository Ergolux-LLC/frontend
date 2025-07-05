export async function login({ email, password }) {
  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch("http://app.ergolux.io.localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
    credentials: "include", // allow receiving & setting cookies
  });

  if (!res.ok) {
    let errorMsg = "Login failed";
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return await res.json(); // should include: { user, tokens }
}
