// src/ui/fragments/loginContent.js

function getContentFragment() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="center-screen">
      <div class="login-card" id="login-container">
        <style>
          html,
          body {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #000;
            color: #fff;
            font-family: system-ui, sans-serif;
            visibility: hidden;
          }

          .center-screen {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
          }

          .login-card {
            background-color: #1e1e1e;
            border: 1px solid #333;
            border-radius: 0.75rem;
            padding: 2rem 2.5rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.75);
            transition: box-shadow 0.2s ease;
          }

          .login-card:hover {
            box-shadow: 0 0 40px rgba(13, 110, 253, 0.4);
          }

          .login-card h2 {
            font-weight: 600;
            font-size: 1.75rem;
            margin-bottom: 0.25rem;
          }

          .login-card small {
            color: #bbb;
          }

          .login-card label {
            margin-top: 1rem;
            display: block;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }

          .login-card input {
            background-color: #121212;
            color: #fff;
            border: 1px solid #444;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }

          .login-card input:focus {
            outline: none;
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
          }

          .btn {
            margin-top: 1.5rem;
            background-color: #0d6efd;
            border: none;
            padding: 0.6rem 1rem;
            color: white;
            width: 100%;
            font-size: 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .btn:hover {
            background-color: #0b5ed7;
          }

          .text-center {
            text-align: center;
          }

          .mt-4 {
            margin-top: 1.5rem;
          }

          .mb-4 {
            margin-bottom: 1.5rem;
          }

          a {
            color: #0d6efd;
            text-decoration: none;
            font-size: 0.875rem;
          }

          a:hover {
            text-decoration: underline;
          }
        </style>

        <div class="text-center mb-4">
          <div style="font-size: 2.5rem; color: #0d6efd">🔒</div>
          <h2>Ergolux 🥊 Voice</h2>
          <small>Agent Login</small>
        </div>

        <form id="loginForm">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            autocomplete="username"
            value="testuser+d288ee12@example.com"
          />

          <label
            for="password"
            style="display: flex; justify-content: space-between"
          >
            <span>Password</span>
            <a href="#">Forgot?</a>
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            autocomplete="current-password"
            value="strongpassword123"
          />

          <button type="submit" class="btn">Log In</button>
        </form>

        <div class="text-center mt-4">
          <small>Don't have an account?</small><br />
          <a href="#">Request Access</a>
        </div>
      </div>
    </div>
  `;

  return wrapper.firstElementChild;
}

export { getContentFragment };
