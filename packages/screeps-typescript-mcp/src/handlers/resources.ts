/**
 * Resource handlers for the MCP server
 */

import { buildIndex, getAllTypeNames, getTypeByName } from "../scraper/index-builder.js";

/**
 * Resource entry definition
 */
interface ResourceEntry {
  uri: string;
  name: string;
  description: string;
}

/**
 * List all available resources
 */
export function listResources(): ResourceEntry[] {
  return [
    {
      uri: "screeps-types://list",
      name: "TypeScript Types List",
      description: "List of all available TypeScript type definitions from typed-screeps",
    },
    {
      uri: "screeps-types://files/list",
      name: "Source Files List",
      description: "List of all source files in typed-screeps",
    },
  ];
}

/**
 * Handle resource read request
 * @param uri Resource URI
 * @returns JSON string content
 */
export async function handleResourceRead(uri: string): Promise<string> {
  const index = await buildIndex();

  if (uri === "screeps-types://list") {
    const typeNames = getAllTypeNames(index);
    return JSON.stringify(
      {
        types: typeNames,
        count: typeNames.length,
        lastUpdated: index.lastUpdated,
      },
      null,
      2
    );
  }

  if (uri === "screeps-types://files/list") {
    const files = Array.from(index.files.keys()).sort();
    return JSON.stringify(
      {
        files,
        count: files.length,
        lastUpdated: index.lastUpdated,
      },
      null,
      2
    );
  }

  // Handle specific type lookup
  const typeMatch = uri.match(/^screeps-types:\/\/type\/(.+)$/);
  if (typeMatch) {
    const typeName = typeMatch[1];
    const typeDef = getTypeByName(index, typeName);

    if (!typeDef) {
      throw new Error(`Type not found: ${typeName}`);
    }

    return JSON.stringify(typeDef, null, 2);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}
