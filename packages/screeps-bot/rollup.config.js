"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import path from "path";

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
    sourcemap: false
  },

  plugins: [
    clear({ targets: ["dist"] }),
    alias({
      entries: [
        { find: "@bot", replacement: path.resolve("src") }
      ]
    }),
    resolve({ 
      rootDir: "src",
      extensions: [".js", ".ts"]
    }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser({
      compress: {
        passes: 3, // Increased from 2 to 3 for more aggressive compression
        drop_console: false, // Keep console.log for Screeps debugging
        drop_debugger: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        booleans_as_integers: false, // Keep booleans as true/false to preserve types in memory
        dead_code: true,
        evaluate: true,
        loops: true,
        unused: true
      },
      mangle: {
        toplevel: true,
        properties: false // Don't mangle properties to avoid breaking Game object references
      },
      format: {
        comments: false,
        semicolons: true,
        preserve_annotations: false
      }
    }),

    // Enable dryRun when not pushing to Screeps or when credentials are invalid
    screeps({
      config: { screeps: cfg },
      dryRun: !shouldPushToScreeps || !hasValidCredentials
    })
  ]
};
