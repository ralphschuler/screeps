/**
 * Scraper for Screeps API documentation
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import type { APIDoc, PropertyDoc, MethodDoc } from "../types.js";

/**
 * Base URL for Screeps API documentation
 */
const API_BASE_URL = "https://docs.screeps.com/api/";

/**
 * Common Screeps API objects to scrape
 */
const API_OBJECTS = [
  "Game",
  "Room",
  "RoomObject",
  "RoomPosition",
  "Creep",
  "Structure",
  "StructureSpawn",
  "StructureExtension",
  "StructureTower",
  "StructureStorage",
  "StructureLink",
  "StructureContainer",
  "StructureController",
  "StructureRampart",
  "StructureWall",
  "StructureRoad",
  "StructureTerminal",
  "StructureLab",
  "StructureNuker",
  "StructureObserver",
  "StructurePowerSpawn",
  "StructureExtractor",
  "Source",
  "Mineral",
  "Deposit",
  "Flag",
  "PathFinder",
  "Memory",
  "RawMemory",
  "InterShardMemory",
  "Constants"
];

/**
 * Scrape API documentation for a specific object
 */
export async function scrapeAPIObject(objectName: string): Promise<APIDoc | null> {
  try {
    const url = `${API_BASE_URL}#${objectName}`;
    const response = await fetch(API_BASE_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the section for this object
    const section = $(`#${objectName}`).parent();
    if (!section.length) {
      return null;
    }

    // Extract title (unused but kept for potential future use)
    // const scrapedTitle = section.find("h1, h2, h3").first().text().trim();
    const content = section.text().trim();

    // Extract properties
    const properties: PropertyDoc[] = [];
    section.find(".api-property").each((_, elem) => {
      const $elem = $(elem);
      const name = $elem.find(".property-name").text().trim();
      const type = $elem.find(".property-type").text().trim();
      const description = $elem.find(".property-description").text().trim();

      if (name) {
        properties.push({ name, type, description });
      }
    });

    // Extract methods
    const methods: MethodDoc[] = [];
    section.find(".api-method").each((_, elem) => {
      const $elem = $(elem);
      const name = $elem.find(".method-name").text().trim();
      const signature = $elem.find(".method-signature").text().trim();
      const description = $elem.find(".method-description").text().trim();
      const returns = $elem.find(".method-returns").text().trim();

      if (name) {
        methods.push({ name, signature, description, returns });
      }
    });

    return {
      id: `api-${objectName.toLowerCase()}`,
      // Use canonical object name as title to avoid inconsistent heading scraping
      title: objectName,
      url,
      content,
      type: "api",
      objectName,
      properties: properties.length > 0 ? properties : undefined,
      methods: methods.length > 0 ? methods : undefined,
      keywords: [objectName.toLowerCase()]
    };
  } catch (error) {
    console.error(`Error scraping API object ${objectName}:`, error);
    return null;
  }
}

/**
 * Scrape all API objects
 */
export async function scrapeAllAPIObjects(): Promise<APIDoc[]> {
  const results: APIDoc[] = [];

  for (const objectName of API_OBJECTS) {
    const doc = await scrapeAPIObject(objectName);
    if (doc) {
      results.push(doc);
    }
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Get list of available API objects
 */
export function getAPIObjectList(): string[] {
  return [...API_OBJECTS];
}
