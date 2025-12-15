/**
 * Utilities for accessing the pre-cloned typed-screeps repository
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the path to the pre-cloned typed-screeps repository
 * The repository is cloned during build time via scripts/clone-types.ts
 * @returns Path to the cloned repository
 */
export function getTypesRepoPath(): string {
  // In production (dist/), go up two levels to reach the package root
  // In development (src/), go up two levels to reach the package root
  const packageRoot = join(__dirname, "..", "..");
  return join(packageRoot, "typed-screeps");
}

/**
 * Get the source directory path from the cloned repository
 * @returns Path to the src directory
 */
export function getSourcePath(): string {
  return join(getTypesRepoPath(), "src");
}

/**
 * Verify that the types repository exists
 * @throws Error if the repository doesn't exist
 */
export async function verifyTypesRepo(): Promise<void> {
  const repoPath = getTypesRepoPath();
  const srcPath = getSourcePath();

  try {
    await fs.access(repoPath);
    await fs.access(srcPath);
  } catch (error) {
    throw new Error(
      `typed-screeps repository not found at ${repoPath}. ` +
      `Please run 'npm run build' to clone the repository during the build process.`
    );
  }
}
