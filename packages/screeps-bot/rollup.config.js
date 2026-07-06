"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
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

function stripTrailingBundleWhitespace() {
  return {
    name: "strip-trailing-bundle-whitespace",
    generateBundle(_options, bundle) {
      for (const artifact of Object.values(bundle)) {
        if (artifact.type === "chunk") {
          artifact.code = artifact.code.replace(/[ \t]+$/gm, "");
        } else if (typeof artifact.source === "string") {
          artifact.source = artifact.source.replace(/[ \t]+$/gm, "");
        }
      }
    }
  };
}

const shouldDeploy = process.env.DEPLOY === "true";
const explicitHostname = cleanEnv(process.env.SCREEPS_HOSTNAME);
const explicitBranch = cleanEnv(process.env.SCREEPS_BRANCH);

const cfg = {
  email: cleanEnv(process.env.SCREEPS_USER),
  password: cleanEnv(process.env.SCREEPS_PASS),
  token: cleanEnv(process.env.SCREEPS_TOKEN),

  protocol: cleanEnv(process.env.SCREEPS_PROTOCOL) || "https",
  hostname: explicitHostname || "screeps.com",
  port: cleanEnv(process.env.SCREEPS_PORT) || 443,
  path: cleanEnv(process.env.SCREEPS_PATH) || "/",
  branch: explicitBranch || "main"
};

// Check if we have valid credentials (either token or email+password)
const hasValidCredentials = cfg.token || (cfg.email && cfg.password);

// Debug logging for deployment troubleshooting
console.log("=== Screeps Deploy Configuration ===");
console.log("Deploy enabled:", shouldDeploy ? "YES" : "NO");
console.log("Credentials Valid:", hasValidCredentials ? "YES" : "NO");
console.log("Credentials type:", cfg.token ? "token" : cfg.email && cfg.password ? "email+password" : "none");
console.log("Target server:", cfg.hostname);
console.log("Target branch:", cfg.branch);
console.log("====================================");

if (shouldDeploy && (!explicitHostname || !explicitBranch)) {
  console.error("\nERROR: DEPLOY=true requires explicit SCREEPS_HOSTNAME and SCREEPS_BRANCH.");
  process.exit(1);
}

if (shouldDeploy && !hasValidCredentials) {
  console.error("\nERROR: DEPLOY=true was set, but Screeps credentials are not configured.");
  console.error("Set one of the following:");
  console.error("  - SCREEPS_TOKEN environment variable, OR");
  console.error("  - Both SCREEPS_USER and SCREEPS_PASS environment variables");
  process.exit(1);
}

if (!shouldDeploy) {
  console.log("Build-only mode: Screeps upload is disabled. Use npm run push or DEPLOY=true to deploy.");
  if (!hasValidCredentials) {
    console.warn("Credentials are not configured. This is fine for local build/test.");
    console.warn("To deploy, set one of the following:");
    console.warn("  - SCREEPS_TOKEN environment variable, OR");
    console.warn("  - Both SCREEPS_USER and SCREEPS_PASS environment variables");
  }
}

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: false
  },

  // Bundle all dependencies into main.js (Screeps doesn't support require())
  // Return false to include everything, including @ralphschuler/* workspace packages
  external: () => false,

  plugins: [
    clear({ targets: ["dist"] }),
    stubNodeBuiltins(), // Stub out Node.js built-ins before other plugins
    alias({
      entries: [
        { find: "@bot", replacement: path.resolve(__dirname, "src") },
        // Resolve @ralphschuler workspace packages to their TypeScript source instead of dist
        // Scoped packages (in packages/@ralphschuler/)
        {
          find: "@ralphschuler/screeps-cache",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-cache/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-clusters",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-clusters/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-console",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-console/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-core",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-core/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-empire",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-empire/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-intershard",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-intershard/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-kernel",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-kernel/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-layouts",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-layouts/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-memory",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-memory/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-pathfinding",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-pathfinding/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-pheromones",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-pheromones/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-remote-mining",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-remote-mining/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-roles",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-roles/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-standards",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-standards/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-stats",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-stats/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-visuals",
          replacement: path.resolve(__dirname, "../@ralphschuler/screeps-visuals/src/index.ts")
        },
        // Non-scoped packages (in packages/)
        {
          find: "@ralphschuler/screeps-chemistry",
          replacement: path.resolve(__dirname, "../screeps-chemistry/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-defense",
          replacement: path.resolve(__dirname, "../screeps-defense/src/index.ts")
        },
        {
          find: "@ralphschuler/screeps-economy/reserves",
          replacement: path.resolve(__dirname, "../screeps-economy/src/reserves/index.ts")
        },
        {
          find: "@ralphschuler/screeps-economy",
          replacement: path.resolve(__dirname, "../screeps-economy/src/index.ts")
        },
        { find: "@ralphschuler/screeps-spawn", replacement: path.resolve(__dirname, "../screeps-spawn/src/index.ts") },
        { find: "@ralphschuler/screeps-utils", replacement: path.resolve(__dirname, "../screeps-utils/src/index.ts") }
      ]
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      include: ["**/*.ts"],
      filterRoot: path.resolve(__dirname, ".."),
      noEmitOnError: true,
      noForceEmit: true
    }),
    resolve({
      rootDir: path.resolve(__dirname, "src"),
      extensions: [".js", ".ts"],
      browser: true, // Use browser-compatible versions of packages (e.g., source-map)
      preferBuiltins: false, // Don't prefer Node.js built-ins over npm packages
      dedupe: ["source-map"] // Deduplicate source-map to avoid multiple copies in bundle
    }),
    commonjs(),
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
    stripTrailingBundleWhitespace(),

    ...(shouldDeploy
      ? [
          screeps({
            config: cfg,
            dryRun: false
          })
        ]
      : [])
  ]
};
