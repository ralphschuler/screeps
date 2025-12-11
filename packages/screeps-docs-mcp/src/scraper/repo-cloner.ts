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
    // TODO: SSL Certificate Error - Git clone fails with certificate verification error
    // Details: Git clone returns "server certificate verification failed. CAfile: none CRLfile: none"
    // Encountered: When calling screeps_docs_list_apis or any screeps-docs-mcp tool
    // Suggested Fix: Configure git to handle SSL certificates properly:
    // 1. Set GIT_SSL_NO_VERIFY=1 environment variable (not recommended for production)
    // 2. Configure git to use system CA certificates: git.env({ GIT_SSL_CAINFO: '/path/to/cacert.pem' })
    // 3. Add git configuration option to disable SSL verification for this specific clone:
    //    await git.clone(DOCS_REPO_URL, tmpDir, ["--depth", "1", "-c", "http.sslVerify=false"]);
    // 4. Ensure the system has proper CA certificates installed
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
