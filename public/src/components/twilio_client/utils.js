// utils.js – helper functions for backend API interactions

import { log, error } from './logger.js';

/**
 * Retrieve an access token and issued identity from backend.
 * Returns a Promise that resolves to { token, identity }.
 */
export function fetchToken(identity) {
  log(`Requesting token for ${identity}`);

  return fetch(`/backend/fenrir?identity=${encodeURIComponent(identity)}`)
    .then(response => {
      if (!response.ok) {
        const msg = `Token fetch failed: ${response.status}`;
        error(msg);
        throw new Error(msg);
      }
      return response.json();
    })
    .then(data => {
      log(`Token received for ${data.identity}`);
      return { token: data.token, identity: data.identity };
    })
    .catch(err => {
      error(err.message || err);
      throw err;
    });
}

// Additional backend calls can be added here following the same pattern
