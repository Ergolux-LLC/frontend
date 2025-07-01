import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import navHTML from './pages/primary_nav.html?raw';

export class Navigation extends LitElement {
  static shadowRootOptions = { mode: 'open', delegatesFocus: true };
  createRenderRoot() {
    return this; // ← disables shadow DOM
  }

  render() {
    return html`${unsafeHTML(navHTML)}`;
  }
}

customElements.define('nav-content', Navigation);
