/**
 * Utilities for cloning the typed-screeps repository
 */

import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const TYPED_SCREEPS_REPO = "https://github.com/screepers/typed-screeps.git";
const REPO_BRANCH = "master";

/**
 * Clone the typed-screeps repository to a temporary directory
 * @returns Path to the cloned repository
 */
export async function cloneTypesRepo(): Promise<string> {
  // Use randomUUID for unique directory name to avoid collisions
  const tempDir = join(tmpdir(), `typed-screeps-${randomUUID()}`);
  
  const options: Partial<SimpleGitOptions> = {
    baseDir: tempDir,
    binary: "git",
    maxConcurrentProcesses: 6,
  };

  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    // TODO: SSL Certificate Error - Git clone fails with certificate verification error
    // Issue URL: https://github.com/ralphschuler/screeps/issues/482
    // Details: Git clone returns "server certificate verification failed. CAfile: none CRLfile: none"
    // Encountered: When calling any screeps-typescript-mcp tool
    // Suggested Fix: Configure git to handle SSL certificates properly:
    // 1. Set GIT_SSL_NO_VERIFY=1 environment variable (not recommended for production)
    // 2. Configure git to use system CA certificates via SimpleGitOptions
    // 3. Add git configuration option to disable SSL verification for this specific clone:
    //    Add "-c", "http.sslVerify=false" to the clone arguments
    // 4. Ensure the system has proper CA certificates installed
    const git: SimpleGit = simpleGit(options);
    
    // Clone with depth 1 for efficiency
    await git.clone(TYPED_SCREEPS_REPO, tempDir, [
      "--depth",
      "1",
      "--branch",
      REPO_BRANCH,
      "--single-branch",
    ]);

    console.log(`Cloned typed-screeps to ${tempDir}`);
    return tempDir;
  } catch (error) {
    // Cleanup on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Error cleaning up after failed clone:", cleanupError);
    }
    throw new Error(`Failed to clone typed-screeps repository: ${error}`);
  }
}

/**
 * Clean up the cloned repository
 * @param repoPath Path to the repository to clean up
 */
export async function cleanupRepo(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
    console.log(`Cleaned up repository at ${repoPath}`);
  } catch (error) {
    console.error(`Error cleaning up repository at ${repoPath}:`, error);
    throw error;
  }
}

/**
 * Get the source directory path from the cloned repository
 * @param repoPath Path to the cloned repository
 * @returns Path to the src directory
 */
export function getSourcePath(repoPath: string): string {
  return join(repoPath, "src");
}
