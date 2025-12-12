#!/usr/bin/env node
/**
 * Build script to parse Screeps documentation at build time
 * This script reads the docs-repo submodule and generates a JSON index
 */

import { promises as fs } from "fs";
import * as path from "path";
import { parseAllAPIObjects } from "../build-scripts/api-scraper.js";
import { parseAllMechanics } from "../build-scripts/mechanics-scraper.js";
import type { DocIndex } from "../src/types.js";

/**
 * Path to the docs repository (submodule)
 */
const DOCS_REPO_PATH = path.resolve(process.cwd(), "docs-repo");

/**
 * Output path for the generated index
 */
const OUTPUT_PATH = path.resolve(process.cwd(), "dist", "docs-index.json");

/**
 * Main build function
 */
async function buildDocsIndex() {
  console.log("Building documentation index from submodule...");
  
  // Verify docs repo exists
  try {
    await fs.access(DOCS_REPO_PATH);
  } catch (error) {
    console.error(`ERROR: Documentation repository not found at ${DOCS_REPO_PATH}`);
    console.error("Please ensure the git submodule is initialized:");
    console.error("  git submodule update --init --recursive");
    process.exit(1);
  }

  try {
    // Parse documentation from the submodule
    console.log("Parsing API documentation...");
    const apiDocs = await parseAllAPIObjects(DOCS_REPO_PATH);
    console.log(`  Found ${apiDocs.length} API objects`);

    console.log("Parsing mechanics documentation...");
    const mechanicsDocs = await parseAllMechanics(DOCS_REPO_PATH);
    console.log(`  Found ${mechanicsDocs.length} mechanics topics`);

    // Build the index
    const index: DocIndex = {
      entries: [...apiDocs, ...mechanicsDocs],
      lastUpdated: new Date(),
      version: "1.0.0"
    };

    console.log(`Total entries: ${index.entries.length}`);

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the index to disk
    console.log(`Writing index to ${OUTPUT_PATH}...`);
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2), "utf-8");

    console.log("Documentation index built successfully!");
  } catch (error) {
    console.error("ERROR: Failed to build documentation index:", error);
    process.exit(1);
  }
}

// Run the build
buildDocsIndex();
