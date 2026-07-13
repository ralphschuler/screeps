"use strict";

/**
 * Offline private-server smoke tests never authenticate through Steam.
 * Keep the pinned server from retrying an unavailable external API and
 * starving the local game loop while token-authenticated test users run.
 */
function SteamWebApi() {}

SteamWebApi.ready = function ready(callback) {
  if (typeof callback === "function") callback(null);
};

module.exports = SteamWebApi;
