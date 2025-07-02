import widgetHTML from './twilio_client_html.js';
import { initTwilio, unregisterTwilio, makeCall, hangupCall } from './twilio_logic.js';
import { fetchToken } from './utils.js';
import { log, error } from './logger.js';

const AGENT_ID = 'agent1';

class TwilioWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = widgetHTML;
    this.setupLogic();
  }

  setupLogic() {
    const startupToggle = this.shadowRoot.getElementById('startup-toggle');
    const callBtn = this.shadowRoot.getElementById('call-button');
    const phoneInput = this.shadowRoot.getElementById('phone-number');

    // Set initial state
    this.setSwitchState('off');

    // Startup toggle logic
    startupToggle.addEventListener('change', async () => {
      if (startupToggle.checked) {
        this.setSwitchState('pending');
        try {
          const { token } = await fetchToken(AGENT_ID);
          await initTwilio(token, AGENT_ID);
          this.setSwitchState('ready');
        } catch (err) {
          error(`[startup error] ${err.message || err}`);
          this.setSwitchState('off');
          startupToggle.checked = false;
        }
      } else {
        await unregisterTwilio();
        this.setSwitchState('off');
      }
    });

    // Outgoing call logic
    callBtn.addEventListener('click', () => {
      if (callBtn.classList.contains('call-idle')) {
        makeCall(phoneInput.value);
      } else if (callBtn.classList.contains('call-active')) {
        hangupCall();
      }
    });

    // Cleanup
    window.addEventListener('beforeunload', unregisterTwilio);
  }

  setSwitchState(state) {
    const toggle = this.shadowRoot.getElementById('startup-toggle');
    const callBtn = this.shadowRoot.getElementById('call-button');

    if (state === 'off') {
      toggle.classList.remove('state-on', 'state-pending');
      toggle.classList.add('state-off');
      callBtn.disabled = true;
      callBtn.classList.remove('call-active');
      callBtn.classList.add('call-idle');
    } else if (state === 'pending') {
      toggle.classList.remove('state-on', 'state-off');
      toggle.classList.add('state-pending');
      callBtn.disabled = true;
    } else if (state === 'ready') {
      toggle.classList.remove('state-off', 'state-pending');
      toggle.classList.add('state-on');
      callBtn.disabled = false;
      callBtn.classList.remove('call-active');
      callBtn.classList.add('call-idle');
    }
  }
}

customElements.define('twilio-widget', TwilioWidget);
