import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import dashboardHTML from './pages/dashboard.html?raw';
import disabledHTML from './pages/disabled.html?raw';

export class MainContent extends LitElement {
  static properties = {
    page: { type: String }
  };

  static shadowRootOptions = { mode: 'open', delegatesFocus: true };

  constructor() {
    super();
    this.page = 'dashboard';
  }

  createRenderRoot() {
    return this; // disable shadow DOM so Bootstrap styles apply
  }

  render() {
    switch (this.page) {
      case 'dashboard':
        return html`${unsafeHTML(dashboardHTML)}`;
      case 'crm':
        return html`${unsafeHTML(disabledHTML)}`;
      default:
        return html`${unsafeHTML(disabledHTML)}`;
    }
  }
}

customElements.define('main-content', MainContent);
