// utils.js – helper functions for backend API interactions

import { log, error } from "./logger.js";

/**
 * Retrieve an access token and issued identity from backend.
 * Returns a Promise that resolves to { token, identity }.
 */
export function fetchToken(identity) {
  log(`Requesting token for ${identity}`);

  return fetch(
    `http://app.ergolux.io.localhost/api/twilio/utility/fenrir?identity=${encodeURIComponent(
      identity
    )}`
  )
    .then(async (response) => {
      const text = await response.text();

      if (!response.ok) {
        error(`Token fetch failed (${response.status}): ${text}`);
        throw new Error(`HTTP ${response.status}`);
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        error(`Invalid JSON in response: ${text}`);
        throw e;
      }
    })
    .then((data) => {
      log(`Token received for ${data.identity}`);
      return { token: data.token, identity: data.identity };
    })
    .catch((err) => {
      error(err.message || err.toString());
      throw err;
    });
}
