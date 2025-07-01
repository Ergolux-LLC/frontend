import './components/dynamic_content/nav-content.js';
import './components/dynamic_content/main-content.js';
import './components/twilio_client/twilio.js';

console.log('[main.js] Module loaded');

export function init() {
  console.log('[main.js] Running init()');

  // Replace entire body content
  document.body.innerHTML = `
    <nav-content></nav-content>
    <main-content></main-content>
    <footer id="main-footer" class="text-center text-muted small mt-4 py-2 border-top"></footer>
    <twilio-widget></twilio-widget>
  `;

  console.log('[main.js] DOM structure injected');

  // Add page navigation behavior
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-page]');
    if (!target) return;

    e.preventDefault();
    const page = target.dataset.page;
    const main = document.querySelector('main-content');

    if (main) {
      console.log(`[main.js] Setting page to "${page}"`);
      main.page = page;
    } else {
      console.warn('[main.js] <main-content> not found');
    }
  });

  console.log('[main.js] Navigation listeners attached');
}
