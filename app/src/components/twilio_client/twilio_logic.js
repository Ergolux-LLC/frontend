// twilio_logic.js – all Twilio‑specific operations

import { Device } from "@twilio/voice-sdk";
import { log, error } from "./logger.js";
import {
  setupAudioPipeline,
  getProcessedMicStream,
  routeTwilioAudio,
  inputGain,
  outputGain,
} from "./audio.js";

let device = null;
let activeCall = null;

/**
 * Initialise Twilio.Device and register the client.
 * Resolves once the device reaches the "registered" state.
 */
export async function initTwilio(token, identity) {
  if (device) {
    log("[twilio] Device already initialized");
    return Promise.resolve();
  }

  log("[twilio] Starting audio pipeline setup");
  await setupAudioPipeline();
  log("[twilio] Audio pipeline ready");

  return new Promise((resolve, reject) => {
    log("[twilio] Creating new Twilio.Device instance");
    device = new Device(token, {
      logLevel: 4,
      codecPreferences: ["opus", "pcmu"],
      enableImprovedSignalingErrorPrecision: true,
      region: "us1",
      mediaStreamFactory: async () => {
        log("[twilio] Supplying processed mic stream via mediaStreamFactory");
        return { stream: getProcessedMicStream() };
      },
    });

    // Hook into AudioHelper to log all emitted events
    const audioHelper = device.audio;
    const originalEmit = audioHelper.emit;
    audioHelper.emit = function (event, ...args) {
      console.log(`[audio event] ${event}`, ...args);
      return originalEmit.call(this, event, ...args);
    };
    console.log("[twilio] AudioHelper event logging enabled");

    device.audio.incoming(false);
    device.audio.outgoing(false);
    device.audio.disconnect(false);
    log("[twilio] Disabled incoming, outgoing, and disconnect sounds");

    device.on("registered", () => {
      log("[twilio] Device registered successfully");
      resolve();
    });

    device.on("error", (err) => {
      error(`[twilio error] ${err.message || err}`);
      reject(err);
    });

    device.on("incoming", (call) => {
      log(`[twilio] Incoming call from ${call.parameters.From}`);

      const event = new CustomEvent("twilio:incoming", { detail: { call } });
      window.dispatchEvent(event);
    });

    setTimeout(() => {
      const audioEls = document.querySelectorAll("audio");
      console.log(`[twilio] Found ${audioEls.length} <audio> element(s)`);

      audioEls.forEach((el, i) => {
        console.log(
          `[twilio] <audio>[${i}] src: ${el.src || "(media stream)"}`
        );
        el.addEventListener("play", () =>
          console.log(`[twilio] <audio>[${i}] started playing`)
        );
        el.addEventListener("volumechange", () =>
          console.log(`[twilio] <audio>[${i}] volume changed: ${el.volume}`)
        );
        el.addEventListener("loadedmetadata", () =>
          console.log(`[twilio] <audio>[${i}] metadata loaded`)
        );
      });
    }, 1000);

    log("[twilio] Registering device...");
    device.register();
  });
}

/** Cleanly unregister the device and release resources */
export async function unregisterTwilio() {
  if (!device) {
    log("[twilio] No device to unregister");
    return;
  }

  log("[twilio] Attempting to unregister and destroy device");
  try {
    await device.unregister();
    device.destroy();
    log("[twilio] Device unregistered and destroyed");
  } catch (err) {
    error(`[unregister error] ${err.message || err}`);
  } finally {
    device = null;
    activeCall = null;
    log("[twilio] Device and call references reset");
  }
}

/** Place an outbound call. Resolves with the Call object once connected. */
export async function makeCall(toNumber) {
  if (!device) throw new Error("Device not initialised");

  const params = { To: toNumber };
  log(`[twilio] Initiating call to ${params.To}`);
  const call = await device.connect({ params });

  activeCall = call;
  log("[twilio] Call object received, setting up event handlers");

  // NOW begin polling for <audio> elements
  const seenAudioElements = new WeakSet();
  const pollAudioElements = () => {
    const audioEls = Array.from(document.querySelectorAll("audio"));
    audioEls.forEach((el, i) => {
      if (seenAudioElements.has(el)) return;
      seenAudioElements.add(el);

      console.log(
        `[twilio] [detect] New <audio> element #${i}, src: ${
          el.src || "(media stream)"
        }`
      );
      el.addEventListener("play", () =>
        console.log(`[twilio] <audio> #${i} started playing`)
      );
      el.addEventListener("volumechange", () =>
        console.log(`[twilio] <audio> #${i} volume changed to: ${el.volume}`)
      );
      el.addEventListener("loadedmetadata", () =>
        console.log(`[twilio] <audio> #${i} metadata loaded`)
      );
    });
  };
  setInterval(pollAudioElements, 200);

  call.on("accept", () => {
    log("[twilio] Call accepted");

    const remoteStream = call.getRemoteStream?.();
    if (remoteStream) {
      log("[twilio] call.getRemoteStream() returned:", remoteStream);

      const tracks = remoteStream.getAudioTracks();
      log(`[twilio] remoteStream contains ${tracks.length} audio track(s)`);
      tracks.forEach((t, i) => {
        log(`[twilio] track[${i}] label: ${t.label}, enabled: ${t.enabled}`);
      });

      log("[twilio] Routing remote media stream to outputGain via Web Audio");
      routeTwilioAudio(remoteStream);
    } else {
      log("[twilio] No remote media stream available on call");
    }

    log(`[twilio] [debug] Speaker gain is now: ${outputGain?.gain?.value}`);

    const poll = setInterval(() => {
      log(
        `[twilio] [poll] Mic gain: ${inputGain?.gain?.value}, Speaker gain: ${outputGain?.gain?.value}`
      );
      if (!activeCall) clearInterval(poll);
    }, 2000);

    window.dispatchEvent(
      new CustomEvent("twilio:callAccepted", { detail: { call } })
    );
  });

  call.on("disconnect", () => {
    log("[twilio] Call disconnected");
    activeCall = null;
    window.dispatchEvent(new CustomEvent("twilio:callDisconnected"));
  });

  call.on("cancel", () => {
    log("[twilio] Call cancelled");
    activeCall = null;
    window.dispatchEvent(new CustomEvent("twilio:callDisconnected"));
  });

  return call;
}

/** Hang up the active call, if any */
export function hangupCall() {
  if (activeCall) {
    log("[twilio] Hanging up active call");
    activeCall.disconnect();
    activeCall = null;
  } else {
    log("[twilio] No active call to hang up");
  }
}

/** Convenience wrappers for inbound call control */
export const acceptIncoming = (call) => {
  log("[twilio] Accepting incoming call");
  call.accept();
};

export const rejectIncoming = (call) => {
  log("[twilio] Rejecting incoming call");
  call.reject();
};

export const hangupIncoming = (call) => {
  log("[twilio] Disconnecting incoming call");
  call.disconnect();
};

/** Read‑only accessors */
export const getDevice = () => {
  log("[twilio] getDevice called");
  return device;
};

export const getActiveCall = () => {
  log("[twilio] getActiveCall called");
  return activeCall;
};
