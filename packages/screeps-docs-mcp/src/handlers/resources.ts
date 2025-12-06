/**
 * MCP Resource handlers for Screeps documentation
 */

import { buildIndex, getEntryById, getEntriesByType } from "../scraper/index-builder.js";

/**
 * Resource handler for API documentation
 */
export async function getAPIResource(objectName: string): Promise<string> {
  const index = await buildIndex();
  const entry = getEntryById(index, `api-${objectName.toLowerCase()}`);

  if (!entry) {
    throw new Error(`API object not found: ${objectName}`);
  }

  return JSON.stringify(entry, null, 2);
}

/**
 * Resource handler for game mechanics documentation
 */
export async function getMechanicsResource(topic: string): Promise<string> {
  const index = await buildIndex();
  const entry = getEntryById(index, `mechanics-${topic.toLowerCase()}`);

  if (!entry) {
    throw new Error(`Mechanics topic not found: ${topic}`);
  }

  return JSON.stringify(entry, null, 2);
}

/**
 * Resource handler for listing all API objects
 */
export async function listAPIObjects(): Promise<string> {
  const index = await buildIndex();
  const entries = getEntriesByType(index, "api");

  const list = entries.map(entry => ({
    id: entry.id,
    title: entry.title,
    url: entry.url
  }));

  return JSON.stringify(list, null, 2);
}

/**
 * Resource handler for listing all mechanics topics
 */
export async function listMechanicsTopics(): Promise<string> {
  const index = await buildIndex();
  const entries = getEntriesByType(index, "mechanics");

  const list = entries.map(entry => ({
    id: entry.id,
    title: entry.title,
    url: entry.url
  }));

  return JSON.stringify(list, null, 2);
}

/**
 * List all available resources
 */
export function listResources(): Array<{ uri: string; name: string; description: string }> {
  return [
    {
      uri: "screeps-docs://api/list",
      name: "API Objects List",
      description: "List all available Screeps API objects"
    },
    {
      uri: "screeps-docs://mechanics/list",
      name: "Mechanics Topics List",
      description: "List all available game mechanics topics"
    },
    {
      uri: "screeps-docs://api/{objectName}",
      name: "API Object Documentation",
      description: "Get documentation for a specific API object (e.g., Game, Room, Creep)"
    },
    {
      uri: "screeps-docs://mechanics/{topic}",
      name: "Game Mechanics Documentation",
      description: "Get documentation for a specific game mechanics topic (e.g., control, market, power)"
    }
  ];
}

/**
 * Parse resource URI and extract parameters
 */
export function parseResourceURI(uri: string): { type: string; param?: string } | null {
  // Check for list URIs first (more specific)
  const listMatch = uri.match(/^screeps-docs:\/\/(api|mechanics)\/list$/);
  if (listMatch && listMatch[1]) {
    return { type: `${listMatch[1]}-list` };
  }

  // Check for specific resource URIs
  const match = uri.match(/^screeps-docs:\/\/(api|mechanics)\/(.+)$/);
  if (match && match[1] && match[2]) {
    return { type: match[1], param: match[2] };
  }

  return null;
}

/**
 * Handle resource read request
 */
export async function handleResourceRead(uri: string): Promise<string> {
  const parsed = parseResourceURI(uri);

  if (!parsed) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  switch (parsed.type) {
    case "api":
      if (!parsed.param) {
        throw new Error("Missing API object name");
      }
      return await getAPIResource(parsed.param);

    case "mechanics":
      if (!parsed.param) {
        throw new Error("Missing mechanics topic");
      }
      return await getMechanicsResource(parsed.param);

    case "api-list":
      return await listAPIObjects();

    case "mechanics-list":
      return await listMechanicsTopics();

    default:
      throw new Error(`Unknown resource type: ${parsed.type}`);
  }
}
