/**
 * Scraper for Screeps game mechanics documentation
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import type { MechanicsDoc, SectionDoc } from "../types.js";

/**
 * Base URL for Screeps documentation
 */
const DOCS_BASE_URL = "https://docs.screeps.com";

/**
 * Common game mechanics topics
 */
const MECHANICS_TOPICS = [
  { path: "/control.html", topic: "control", name: "Room Control" },
  { path: "/creeps.html", topic: "creeps", name: "Creeps" },
  { path: "/defense.html", topic: "defense", name: "Defense" },
  { path: "/market.html", topic: "market", name: "Market" },
  { path: "/power.html", topic: "power", name: "Power" },
  { path: "/minerals.html", topic: "minerals", name: "Minerals" },
  { path: "/respawn.html", topic: "respawn", name: "Respawn" },
  { path: "/invaders.html", topic: "invaders", name: "Invaders" },
  { path: "/cpu-limit.html", topic: "cpu", name: "CPU Limit" },
  { path: "/gcl.html", topic: "gcl", name: "Global Control Level" },
  { path: "/simultaneous-actions.html", topic: "actions", name: "Simultaneous Actions" }
];

/**
 * Scrape game mechanics documentation for a specific topic
 */
export async function scrapeMechanicsTopic(path: string, topic: string, name: string): Promise<MechanicsDoc | null> {
  try {
    const url = `${DOCS_BASE_URL}${path}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract main content
    const contentArea = $("article, .content, main").first();
    if (!contentArea.length) {
      return null;
    }

    const title = contentArea.find("h1").first().text().trim() || name;
    const content = contentArea.text().trim();

    // Extract sections
    const sections: SectionDoc[] = [];
    contentArea.find("h2, h3").each((_, elem) => {
      const $elem = $(elem);
      const heading = $elem.text().trim();

      // Get content until next heading
      const sectionContent: string[] = [];
      let next = $elem.next();

      while (next.length && !next.is("h2, h3")) {
        if (next.is("p")) {
          sectionContent.push(next.text().trim());
        } else if (next.is("pre, code")) {
          sectionContent.push(next.text().trim());
        }
        next = next.next();
      }

      if (heading && sectionContent.length > 0) {
        sections.push({
          heading,
          content: sectionContent.join("\n\n")
        });
      }
    });

    return {
      id: `mechanics-${topic}`,
      title,
      url,
      content,
      type: "mechanics",
      topic,
      category: "game-mechanics",
      sections: sections.length > 0 ? sections : undefined,
      keywords: [topic, name.toLowerCase()]
    };
  } catch (error) {
    console.error(`Error scraping mechanics topic ${topic}:`, error);
    return null;
  }
}

/**
 * Scrape all game mechanics topics
 */
export async function scrapeAllMechanics(): Promise<MechanicsDoc[]> {
  const results: MechanicsDoc[] = [];

  for (const { path, topic, name } of MECHANICS_TOPICS) {
    const doc = await scrapeMechanicsTopic(path, topic, name);
    if (doc) {
      results.push(doc);
    }
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Get list of available mechanics topics
 */
export function getMechanicsTopicList(): Array<{ topic: string; name: string }> {
  return MECHANICS_TOPICS.map(({ topic, name }) => ({ topic, name }));
}
