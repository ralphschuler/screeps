import { expect } from "chai";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const SteamWebApi = require("../../steam-webapi-ci-stub.cjs") as {
  ready: (callback: (error: Error | null) => void) => void;
};

describe("offline private-server Steam API stub", () => {
  it("starts the server without an external Steam request", () => {
    let callbackError: Error | null | undefined;

    SteamWebApi.ready(error => {
      callbackError = error;
    });

    expect(callbackError).to.equal(null);
  });

  it("is installed only by the private-server CI image", () => {
    const dockerfile = readFileSync(new URL("../../Dockerfile", import.meta.url), "utf8");

    expect(dockerfile).to.include("steam-webapi-ci-stub.cjs");
    expect(dockerfile).to.include("/usr/local/lib/node_modules/screeps/node_modules/steam-webapi/index.js");
  });
});
