console.log('[login.js] Loaded login module');

document.querySelector('form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username')?.value || '(blank)';
  const password = document.getElementById('password')?.value || '(blank)';
  console.log('[login.js] Form submitted');
  console.log(`[login.js] Username entered: "${username}"`);
  console.log(`[login.js] Password entered: "${'*'.repeat(password.length)}"`);

  // ───── SIMULATED LOGIN ─────
  console.log('[login.js] Simulating login (bypassing authentication)');
  await new Promise(resolve => setTimeout(resolve, 300)); // simulate network delay

  // Simulated "token"
  const fakeToken = 'dev-token';
  localStorage.setItem('ergolux_token', fakeToken);
  console.log('[login.js] Simulated token stored in localStorage');

  // Remove login UI
  const container = document.getElementById('login-container');
  if (container) {
    container.remove();
    console.log('[login.js] Removed login container from DOM');
  } else {
    console.warn('[login.js] Login container not found during removal');
  }

  // Load main app logic
  console.log('[login.js] Importing main.js to initialize app');
  const app = await import('/src/main.js');
  if (app?.init) {
    console.log('[login.js] Calling app.init()');
    app.init();
  } else {
    console.warn('[login.js] main.js did not export an init() function');
  }

  // ───── REAL AUTH LOGIC GOES HERE ─────
  /*
  console.log('[login.js] Sending credentials to API...');
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const { token } = await res.json();
    localStorage.setItem('ergolux_token', token);
    console.log('[login.js] Token received and stored');

    document.getElementById('login-container')?.remove();
    const app = await import('/src/main.js');
    if (app.init) app.init();
  } else {
    console.error('[login.js] Login failed – invalid credentials');
    alert('Invalid login');
  }
  */
});
