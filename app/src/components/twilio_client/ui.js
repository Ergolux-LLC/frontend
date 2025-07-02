// ui.js – handles all DOM/UI manipulation

import { acceptIncoming, rejectIncoming, hangupIncoming } from './twilio_logic.js';
import { attach, log } from './logger.js';
import { setInputGain, setOutputGain } from './audio.js';

// ─────────────────── DOM REFERENCES ───────────────────
const refs = {
  startupToggle:       document.getElementById('startup-toggle'),
  callBtn:             document.getElementById('call-button'),
  phoneInput:          document.getElementById('phone-number'),

  // Incoming-call UI
  incomingDiv:         document.getElementById('incoming-call'),
  incomingNumberEl:    document.getElementById('incoming-number'),
  incomingAcceptBtn:   document.getElementById('button-accept-incoming'),
  incomingRejectBtn:   document.getElementById('button-reject-incoming'),

  // Logs & volume bars
  logDiv:              document.getElementById('log'),
  volumeIndicators:    document.getElementById('volume-indicators'),
  inputVolumeBar:      document.getElementById('mic-volume'),
  outputVolumeBar:     document.getElementById('speaker-volume'),
};

// ─────────────────── LOGGER SINK ───────────────────
function addToLog({ msg }) {
  if (!refs.logDiv) return;
  refs.logDiv.innerHTML += `> ${msg}\n`;
  refs.logDiv.scrollTop = refs.logDiv.scrollHeight;
}
attach(addToLog);

// ─────────────────── STARTUP TOGGLE COLOR ───────────────────
function setSwitchState(state) {
  const cls = refs.startupToggle.classList;
  cls.remove('state-ready', 'state-pending', 'state-off');

  const controls = [
    refs.callBtn,
    refs.phoneInput,
    refs.inputVolumeBar,
    refs.outputVolumeBar,
  ];

  switch (state) {
    case 'ready':
      cls.add('state-ready');
      controls.forEach(el => el && (el.disabled = false));
      break;
    case 'pending':
      cls.add('state-pending');
      controls.forEach(el => el && (el.disabled = true));
      break;
    default:
      cls.add('state-off');
      controls.forEach(el => el && (el.disabled = true));
      break;
  }
}

// ─────────────────── VOLUME CONTROL HOOKS ───────────────────
if (refs.inputVolumeBar) {
  refs.inputVolumeBar.addEventListener('input', e => {
    console.log('[ui] Raw mic input slider value:', e.target.value);
    const value = parseFloat(e.target.value);
    setInputGain(value);
    log(`Mic volume set to ${value.toFixed(2)}`);
  });
}

if (refs.outputVolumeBar) {
  refs.outputVolumeBar.addEventListener('input', e => {
    console.log('[ui] Raw speaker volume slider value:', e.target.value);
    const value = parseFloat(e.target.value);
    setOutputGain(value);
    log(`Speaker volume set to ${value.toFixed(2)}`);
  });
}



// ─────────────────── OUTGOING CALL UI ───────────────────
function onCallAccepted() {
  refs.callBtn.disabled = false;
  refs.callBtn.classList.remove('call-idle');
  refs.callBtn.classList.add('call-active');

  document.querySelector('.call-bar')?.classList.add('call-active');
  log('Call in progress...');
}

function onCallDisconnected() {
  refs.callBtn.disabled = false;
  refs.callBtn.classList.remove('call-active');
  refs.callBtn.classList.add('call-idle');

  document.querySelector('.call-bar')?.classList.remove('call-active');
  log('Call disconnected.');
}

// ─────────────────── INCOMING CALL UI ───────────────────
function showIncoming(call) {
  refs.incomingDiv.classList.remove('hide');
  if (refs.incomingNumberEl) {
    refs.incomingNumberEl.textContent = call.parameters.From;
  }

  refs.incomingAcceptBtn.addEventListener('click', () => {
    acceptIncoming(call);
    toggleIncomingButtons('accepted');
    log('Call accepted');
  }, { once: true });

  refs.incomingRejectBtn.addEventListener('click', () => {
    rejectIncoming(call);
    resetIncomingUI();
    log('Call rejected');
  }, { once: true });
}

function toggleIncomingButtons(state) {
  if (state === 'accepted') {
    refs.incomingAcceptBtn.classList.add('hide');
    refs.incomingRejectBtn.classList.add('hide');
  } else {
    refs.incomingAcceptBtn.classList.remove('hide');
    refs.incomingRejectBtn.classList.remove('hide');
  }
}

function resetIncomingUI() {
  if (refs.incomingNumberEl) refs.incomingNumberEl.textContent = '';
  toggleIncomingButtons('reset');
  refs.incomingDiv.classList.add('hide');
}

// ─────────────────── LOG PANEL TOGGLE ───────────────────
const logsBtn = document.getElementById('logs-btn');
const closeLogs = document.getElementById('close-logs');
const logOverlay = document.getElementById('log-overlay');

if (logsBtn && closeLogs && logOverlay) {
  logsBtn.addEventListener('click', () => {
    logOverlay.classList.add('show');
  });

  closeLogs.addEventListener('click', () => {
    logOverlay.classList.remove('show');
  });
}

// ─────────────────── BIND TWILIO EVENTS ───────────────────
window.addEventListener('twilio:incoming', ({ detail: { call } }) => {
  log(`Incoming call from ${call.parameters.From}`);
  showIncoming(call);
});

window.addEventListener('twilio:callAccepted', onCallAccepted);
window.addEventListener('twilio:callDisconnected', onCallDisconnected);

// ─────────────────── PUBLIC API ───────────────────
export function getDomRefs() {
  return {
    startupToggle: refs.startupToggle,
    callBtn:       refs.callBtn,
    phoneInput:    refs.phoneInput,
  };
}

setSwitchState('off');
refs.callBtn.disabled = true;
refs.callBtn.classList.add('call-idle');

export { setSwitchState };
