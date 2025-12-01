"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";

const cfg = {
  user: process.env.SCREEPS_USERNAME,
  pass: process.env.SCREEPS_PASS,
  token: process.env.SCREEPS_TOKEN,
  protocol: process.env.SCREEPS_PROTOCOL || "https",
  hostname: process.env.SCREEPS_HOSTNAME || "screeps.com",
  port: process.env.SCREEPS_PORT || 443,
  path: process.env.SCREEPS_PATH || "/",
  branch: process.env.SCREEPS_BRANCH || "main"
};

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
    screeps({ config: { screeps: cfg }, dryRun: cfg.token == null })
  ]
};
