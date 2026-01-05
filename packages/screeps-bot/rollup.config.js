"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";
import stubNodeBuiltins from "./rollup-plugin-stub-node-builtins.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    stubNodeBuiltins(), // Stub out Node.js built-ins before other plugins
    alias({
      entries: [
        { find: "@bot", replacement: path.resolve(__dirname, "src") }
      ]
    }),
    resolve({ 
      rootDir: path.resolve(__dirname, "src"),
      extensions: [".js", ".ts"],
      browser: true, // Use browser-compatible versions of packages (e.g., source-map)
      preferBuiltins: false // Don't prefer Node.js built-ins over npm packages
    }),
    commonjs(),
    typescript({ 
      tsconfig: "./tsconfig.json",
      check: false, // Disable type checking, rely on separate npm run typecheck
    }),
    terser({
      compress: {
        passes: 3, // Increased from 2 to 3 for more aggressive compression
        drop_console: false, // Keep console.log for Screeps debugging
        drop_debugger: true,
        // Disabled unsafe optimizations that can create invalid syntax in Screeps environment
        // unsafe_comps was causing ternary operators with decimals (x ? .5 : .3) to be misinterpreted as optional chaining (x?.5)
        unsafe: false,
        unsafe_arrows: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_regexp: false,
        unsafe_undefined: false,
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
        preserve_annotations: false,
        // CRITICAL FIX: beautify adds spaces around operators to prevent ternary with decimals
        // from creating invalid syntax that looks like optional chaining
        // Example: x ? .5 : .3 becomes x?.5:.3 (looks like optional chaining) without beautify
        beautify: true,
        // But disable indentation and formatting to keep size down
        indent_level: 0,
        wrap_func_args: false
      }
    }),

    // Enable dryRun when not pushing to Screeps or when credentials are invalid
    screeps({
      config: { screeps: cfg },
      dryRun: !shouldPushToScreeps || !hasValidCredentials
    })
  ]
};
