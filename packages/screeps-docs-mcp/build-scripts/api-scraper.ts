/**
 * Scraper for Screeps API documentation from GitHub repository
 */

import type { APIDoc, PropertyDoc, MethodDoc } from "../src/types.js";
import { readRepoFile, listRepoFiles } from "./repo-cloner.js";
import { 
  extractTitle, 
  stripMarkdown, 
  extractAPIProperties, 
  extractAPIMethods,
  extractFrontMatter 
} from "./markdown-parser.js";

/**
 * Base URL for Screeps API documentation (for reference links)
 */
const API_BASE_URL = "https://docs.screeps.com/api/";

/**
 * Parse API documentation for a specific object from markdown file
 */
export async function parseAPIObject(repoPath: string, filename: string): Promise<APIDoc | null> {
  try {
    const filePath = `api/source/${filename}`;
    const content = await readRepoFile(repoPath, filePath);
    
    // Extract object name from filename (e.g., "Game.md" -> "Game")
    const objectName = filename.replace(/\.md$/, "");
    
    // Extract title from markdown
    const title = extractTitle(content, filename);
    
    // Extract plain text content
    const { body } = extractFrontMatter(content);
    const plainContent = stripMarkdown(body);
    
    // Extract properties and methods
    const properties = extractAPIProperties(content);
    const methods = extractAPIMethods(content);
    
    const url = `${API_BASE_URL}#${objectName}`;
    
    return {
      id: `api-${objectName.toLowerCase()}`,
      title,
      url,
      content: plainContent,
      type: "api",
      objectName,
      properties: properties.length > 0 ? properties : undefined,
      methods: methods.length > 0 ? methods : undefined,
      keywords: [objectName.toLowerCase(), title.toLowerCase()]
    };
  } catch (error) {
    console.error(`Error parsing API object from ${filename}:`, error);
    return null;
  }
}

/**
 * Parse all API objects from the repository
 */
export async function parseAllAPIObjects(repoPath: string): Promise<APIDoc[]> {
  const results: APIDoc[] = [];

  // List all markdown files in the api/source directory
  const files = await listRepoFiles(repoPath, "api/source");
  
  for (const filename of files) {
    // Skip constants.md as it's handled separately
    if (filename === "constants.md") {
      continue;
    }
    
    const doc = await parseAPIObject(repoPath, filename);
    if (doc) {
      results.push(doc);
    }
  }

  return results;
}

/**
 * Get list of available API objects from the repository
 */
export async function getAPIObjectList(repoPath: string): Promise<string[]> {
  const files = await listRepoFiles(repoPath, "api/source");
  return files
    .filter(f => f !== "constants.md")
    .map(f => f.replace(/\.md$/, ""))
    .sort();
}
