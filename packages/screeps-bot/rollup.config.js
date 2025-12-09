"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";

// Helper: returns undefined if the env value is empty or undefined
function cleanEnv(value) {
  if (!value || value.trim() === "") return undefined;
  return value.trim();
}

const cfg = {
  email: cleanEnv(process.env.SCREEPS_USER),
  password: cleanEnv(process.env.SCREEPS_PASS),
  token: cleanEnv(process.env.SCREEPS_TOKEN),

  protocol: cleanEnv(process.env.SCREEPS_PROTOCOL) || "https",
  hostname: cleanEnv(process.env.SCREEPS_HOSTNAME) || "screeps.com",
  port: cleanEnv(process.env.SCREEPS_PORT) || 443,
  path: cleanEnv(process.env.SCREEPS_PATH) || "/",
  branch: cleanEnv(process.env.SCREEPS_BRANCH) || "main"
};

// Check if we have valid credentials (either token or email+password)
const hasValidCredentials = cfg.token || (cfg.email && cfg.password);

// Only push to Screeps when DEST=screeps is set (via npm run push)
const shouldPushToScreeps = process.env.DEST === "screeps";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),

    // Enable dryRun when not pushing to Screeps or when credentials are invalid
    screeps({
      config: { screeps: cfg },
      dryRun: !shouldPushToScreeps || !hasValidCredentials
    })
  ]
};
