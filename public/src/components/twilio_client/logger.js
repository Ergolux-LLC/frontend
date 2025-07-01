// logger.js – centralised logging utility
// Other modules import { log, warn, error } and forget about the DOM.
// ui.js calls attach() once the log element exists, injecting a sink that
// renders log entries. Early logs are buffered until the sink is ready.

let sink = null;           // function(entry) where entry = { ts, level, msg }
const buffer = [];         // holds log entries generated before UI injection

function _write(level, msg) {
  const entry = { ts: Date.now(), level, msg };

  if (sink) {
    sink(entry);
  } else {
    buffer.push(entry);
  }

  // Still mirror to browser console for dev convenience
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[consoleMethod](msg);
}

export function attach(uiSink) {
  sink = uiSink;
  buffer.splice(0).forEach(uiSink); // flush any queued logs
}

export const log   = msg => _write('info',  msg);
export const warn  = msg => _write('warn',  msg);
export const error = msg => _write('error', msg);