/**
 * Repository cloner for Screeps documentation
 */

import { simpleGit } from "simple-git";
import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";

/**
 * GitHub repository URL for Screeps documentation
 */
const DOCS_REPO_URL = "https://github.com/screeps/docs.git";

/**
 * Clone the Screeps documentation repository to a temporary directory
 * @returns Path to the cloned repository
 */
export async function cloneDocsRepo(): Promise<string> {
  // Create a unique temporary directory for this clone
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "screeps-docs-"));
  
  try {
    const git = simpleGit();
    
    // Clone the repository with depth 1 (shallow clone) for efficiency
    await git.clone(DOCS_REPO_URL, tmpDir, ["--depth", "1"]);
    
    return tmpDir;
  } catch (error) {
    // Clean up on error
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    throw new Error(`Failed to clone documentation repository: ${error}`);
  }
}

/**
 * Clean up a cloned repository directory
 * @param repoPath Path to the repository to clean up
 */
export async function cleanupRepo(repoPath: string): Promise<void> {
  try {
    await fs.rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to clean up repository at ${repoPath}:`, error);
  }
}

/**
 * Read a file from the repository
 * @param repoPath Path to the cloned repository
 * @param filePath Relative path to the file within the repository
 * @returns File contents as string
 */
export async function readRepoFile(repoPath: string, filePath: string): Promise<string> {
  const fullPath = path.join(repoPath, filePath);
  return await fs.readFile(fullPath, "utf-8");
}

/**
 * List files in a directory within the repository
 * @param repoPath Path to the cloned repository
 * @param dirPath Relative path to the directory within the repository
 * @returns Array of file names
 */
export async function listRepoFiles(repoPath: string, dirPath: string): Promise<string[]> {
  const fullPath = path.join(repoPath, dirPath);
  const entries = await fs.readdir(fullPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith(".md"))
    .map(entry => entry.name);
}
