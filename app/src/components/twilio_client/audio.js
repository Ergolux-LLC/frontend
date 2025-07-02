// audio.js – encapsulated volume control for mic and speaker

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
console.log('[audio] AudioContext initialized');

let inputStream = null;
let inputGain = null;
let inputStreamNode = null;

let outputGain = audioCtx.createGain();
outputGain.connect(audioCtx.destination);
console.log('[audio] Output gain node created and connected to destination');

/** Initializes the full audio pipeline */
export async function setupAudioPipeline() {
  try {
    console.log('[audio] Setting up audio pipeline...');
    inputGain = audioCtx.createGain();
    console.log('[audio] Input gain node created');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[audio] Microphone access granted');

    inputStream = stream;
    inputStreamNode = audioCtx.createMediaStreamSource(stream);
    console.log('[audio] MediaStreamSource created from microphone stream');

    inputStreamNode.connect(inputGain);
    console.log('[audio] Input stream node connected to input gain node');

    return true;
  } catch (err) {
    console.error('[audio] setup failed:', err);
    return false;
  }
}

/** Returns the processed mic MediaStream */
export function getProcessedMicStream() {
  const dest = audioCtx.createMediaStreamDestination();
  console.log('[audio] Created MediaStreamDestination for processed mic');

  inputGain.connect(dest);
  console.log('[audio] Input gain connected to destination');

  return dest.stream;
}

/** Routes Twilio output to Web Audio output chain */
export function routeTwilioAudio(mediaStream) {
  try {
    console.log('[audio] Routing Twilio audio stream...');
    const twilioOutput = audioCtx.createMediaStreamSource(mediaStream);
    twilioOutput.connect(outputGain);
    console.log('[audio] Twilio stream connected to output gain');
  } catch (err) {
    console.error('[audio] failed to route Twilio output:', err);
  }
}

/** Set speaker volume (0.0 – 1.0) */
export function setOutputGain(value) {
  console.log(`[audio] Setting speaker volume to ${value}`);
  outputGain.gain.value = value;
  console.log(`[audio] Speaker volume is now ${outputGain.gain.value}`);
}

/** Set mic input volume (0.0 – 1.0) */
export function setInputGain(value) {
  console.log(`[audio] Setting mic input volume to ${value}`);
  inputGain.gain.value = value;
  console.log(`[audio] Mic input volume is now ${inputGain.gain.value}`);
}

export { audioCtx, inputGain, outputGain };
