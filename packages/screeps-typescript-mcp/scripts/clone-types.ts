#!/usr/bin/env node
/**
 * Build-time script to clone the typed-screeps repository
 * This runs during `npm run build` to prepare the types for distribution
 */

import { simpleGit } from "simple-git";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TYPED_SCREEPS_REPO = "https://github.com/screepers/typed-screeps.git";
const REPO_BRANCH = "master";
const TYPES_DIR = join(__dirname, "..", "typed-screeps");

async function cloneTypesRepo() {
  console.log("Cloning typed-screeps repository for build...");

  try {
    // Check if directory already exists
    try {
      await fs.access(TYPES_DIR);
      console.log(`Directory ${TYPES_DIR} already exists, removing...`);
      await fs.rm(TYPES_DIR, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, which is fine
    }

    // Create parent directory
    await fs.mkdir(TYPES_DIR, { recursive: true });

    // Clone repository with depth 1 for efficiency
    const git = simpleGit();
    await git.clone(TYPED_SCREEPS_REPO, TYPES_DIR, [
      "--depth",
      "1",
      "--branch",
      REPO_BRANCH,
      "--single-branch",
    ]);

    console.log(`Successfully cloned typed-screeps to ${TYPES_DIR}`);

    // Remove .git directory to save space
    const gitDir = join(TYPES_DIR, ".git");
    try {
      await fs.rm(gitDir, { recursive: true, force: true });
      console.log("Removed .git directory to reduce size");
    } catch (error) {
      console.warn("Could not remove .git directory:", error);
    }

    console.log("Build-time clone completed successfully");
  } catch (error) {
    console.error("Failed to clone typed-screeps repository:", error);
    process.exit(1);
  }
}

cloneTypesRepo();
