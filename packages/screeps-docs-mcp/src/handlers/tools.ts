/**
 * MCP Tool handlers for Screeps documentation operations
 * 
 * TODO(P2): FEATURE - Add fuzzy search support for better query matching
 * Allow typos and partial matches for improved usability
 * TODO(P3): PERF - Implement search result caching with TTL
 * Repeated searches for common terms could benefit from caching
 * TODO(P2): DOC - Add JSDoc for return types of all handler functions
 * Better documentation improves maintainability
 */

import { z } from "zod";
import { buildIndex, searchIndex, getEntryById, getEntriesByType } from "../scraper/index-builder.js";

/**
 * Tool schemas
 */
export const toolSchemas = {
  search: z.object({
    query: z.string().describe("Search query for documentation")
  }),

  getAPI: z.object({
    objectName: z.string().describe("Name of the API object (e.g., Game, Room, Creep)")
  }),

  getMechanics: z.object({
    topic: z.string().describe("Game mechanics topic (e.g., control, market, power)")
  }),

  listAPIs: z.object({}),

  listMechanics: z.object({})
};

/**
 * Tool definitions
 */
export function listTools() {
  return [
    {
      name: "screeps_docs_search",
      description: "Search Screeps documentation by keyword or phrase",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for documentation"
          }
        },
        required: ["query"]
      }
    },
    {
      name: "screeps_docs_get_api",
      description: "Get API reference documentation for a specific Screeps object",
      inputSchema: {
        type: "object",
        properties: {
          objectName: {
            type: "string",
            description: "Name of the API object (e.g., Game, Room, Creep, StructureSpawn)"
          }
        },
        required: ["objectName"]
      }
    },
    {
      name: "screeps_docs_get_mechanics",
      description: "Get game mechanics documentation for a specific topic",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Game mechanics topic (e.g., control, market, power, creeps)"
          }
        },
        required: ["topic"]
      }
    },
    {
      name: "screeps_docs_list_apis",
      description: "List all available Screeps API objects",
      inputSchema: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "screeps_docs_list_mechanics",
      description: "List all available game mechanics topics",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  ];
}

/**
 * Handle search tool
 */
export async function handleSearch(args: z.infer<typeof toolSchemas.search>) {
  const index = await buildIndex();
  const results = searchIndex(index, args.query);

  const formatted = results.slice(0, 10).map(result => ({
    title: result.entry.title,
    id: result.entry.id,
    url: result.entry.url,
    type: result.entry.type,
    score: result.score,
    matches: result.matches,
    preview: result.entry.content.substring(0, 200) + "..."
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ query: args.query, count: results.length, results: formatted }, null, 2)
      }
    ]
  };
}

/**
 * Handle getAPI tool
 */
export async function handleGetAPI(args: z.infer<typeof toolSchemas.getAPI>) {
  const index = await buildIndex();
  const entry = getEntryById(index, `api-${args.objectName.toLowerCase()}`);

  if (!entry) {
    const apiEntries = getEntriesByType(index, "api");
    const available = apiEntries.map(e => e.title).sort();
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: `API object not found: ${args.objectName}`,
              available
            },
            null,
            2
          )
        }
      ]
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(entry, null, 2)
      }
    ]
  };
}

/**
 * Handle getMechanics tool
 */
export async function handleGetMechanics(args: z.infer<typeof toolSchemas.getMechanics>) {
  const index = await buildIndex();
  const entry = getEntryById(index, `mechanics-${args.topic.toLowerCase()}`);

  if (!entry) {
    const mechanicsEntries = getEntriesByType(index, "mechanics");
    const available = mechanicsEntries.map(e => ({ topic: e.id.replace("mechanics-", ""), name: e.title }));
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: `Mechanics topic not found: ${args.topic}`,
              available
            },
            null,
            2
          )
        }
      ]
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(entry, null, 2)
      }
    ]
  };
}

/**
 * Handle listAPIs tool
 */
export async function handleListAPIs() {
  const index = await buildIndex();
  const apiEntries = getEntriesByType(index, "api");
  const apiList = apiEntries.map(e => e.title).sort();

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ apis: apiList, count: apiList.length }, null, 2)
      }
    ]
  };
}

/**
 * Handle listMechanics tool
 */
export async function handleListMechanics() {
  const index = await buildIndex();
  const mechanicsEntries = getEntriesByType(index, "mechanics");
  const mechanicsList = mechanicsEntries.map(e => ({ 
    topic: e.id.replace("mechanics-", ""), 
    name: e.title 
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ mechanics: mechanicsList, count: mechanicsList.length }, null, 2)
      }
    ]
  };
}
