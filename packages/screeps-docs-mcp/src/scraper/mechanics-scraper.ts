/**
 * Scraper for Screeps game mechanics documentation from GitHub repository
 */

import type { MechanicsDoc, SectionDoc } from "../types.js";
import { readRepoFile, listRepoFiles } from "./repo-cloner.js";
import { extractTitle, stripMarkdown, extractSections, extractFrontMatter } from "./markdown-parser.js";

/**
 * Base URL for Screeps documentation (for reference links)
 */
const DOCS_BASE_URL = "https://docs.screeps.com";

/**
 * Mapping of filename to topic identifier
 * Note: resources.md is mapped to "minerals" to maintain compatibility with existing API
 */
const FILENAME_TO_TOPIC: Record<string, string> = {
  "control.md": "control",
  "creeps.md": "creeps",
  "defense.md": "defense",
  "market.md": "market",
  "power.md": "power",
  "resources.md": "minerals", // Mapped to minerals for backwards compatibility
  "respawn.md": "respawn",
  "invaders.md": "invaders",
  "cpu-limit.md": "cpu",
  "simultaneous-actions.md": "actions"
};

/**
 * Parse game mechanics documentation for a specific file
 */
export async function parseMechanicsTopic(repoPath: string, filename: string): Promise<MechanicsDoc | null> {
  try {
    const filePath = `source/${filename}`;
    const content = await readRepoFile(repoPath, filePath);
    
    // Get topic identifier
    const topic = FILENAME_TO_TOPIC[filename] || filename.replace(/\.md$/, "");
    
    // Extract title from markdown
    const title = extractTitle(content, filename);
    
    // Extract plain text content
    const { body } = extractFrontMatter(content);
    const plainContent = stripMarkdown(body);
    
    // Extract sections
    const sections = extractSections(content);
    
    // Construct URL
    const htmlFilename = filename.replace(/\.md$/, ".html");
    const url = `${DOCS_BASE_URL}/${htmlFilename}`;
    
    return {
      id: `mechanics-${topic}`,
      title,
      url,
      content: plainContent,
      type: "mechanics",
      topic,
      category: "game-mechanics",
      sections: sections.length > 0 ? sections : undefined,
      keywords: [topic, title.toLowerCase()]
    };
  } catch (error) {
    console.error(`Error parsing mechanics topic from ${filename}:`, error);
    return null;
  }
}

/**
 * Parse all game mechanics topics from the repository
 */
export async function parseAllMechanics(repoPath: string): Promise<MechanicsDoc[]> {
  const results: MechanicsDoc[] = [];

  // Get list of mechanics files to parse
  const mechanicsFiles = Object.keys(FILENAME_TO_TOPIC);
  
  for (const filename of mechanicsFiles) {
    const doc = await parseMechanicsTopic(repoPath, filename);
    if (doc) {
      results.push(doc);
    }
  }

  return results;
}

/**
 * Get list of available mechanics topics from the repository
 */
export async function getMechanicsTopicList(repoPath: string): Promise<Array<{ topic: string; name: string }>> {
  const results: Array<{ topic: string; name: string }> = [];
  const mechanicsFiles = Object.keys(FILENAME_TO_TOPIC);
  
  for (const filename of mechanicsFiles) {
    try {
      const filePath = `source/${filename}`;
      const content = await readRepoFile(repoPath, filePath);
      const title = extractTitle(content, filename);
      const topic = FILENAME_TO_TOPIC[filename];
      
      results.push({ topic, name: title });
    } catch (error) {
      console.error(`Error reading mechanics file ${filename}:`, error);
    }
  }
  
  return results;
}
