/**
 * Tool handlers for the MCP server
 */

import { z } from "zod";
import {
  buildIndex,
  searchIndex,
  getTypeByName,
  getAllTypeNames,
  getTypesByFile,
} from "../scraper/index-builder.js";
import { categorizeType } from "../scraper/type-parser.js";
import type { TypeDefinition, CategorizedType } from "../types.js";

/**
 * Tool schemas for validation
 */
export const toolSchemas = {
  search: z.object({
    query: z.string().describe("Search query for type definitions"),
    limit: z.number().optional().describe("Maximum number of results (default: 20)"),
  }),

  getType: z.object({
    name: z.string().describe("Name of the type to retrieve"),
  }),

  listTypes: z.object({
    filter: z.string().optional().describe("Optional filter by category or file"),
  }),

  getRelated: z.object({
    name: z.string().describe("Name of the type to get related types for"),
  }),

  getByFile: z.object({
    fileName: z.string().describe("Name of the source file"),
  }),
};

/**
 * Search for type definitions
 */
export async function handleSearch(
  args: z.infer<typeof toolSchemas.search>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = await buildIndex();
  const results = searchIndex(index, args.query, args.limit);

  const output = {
    query: args.query,
    count: results.length,
    results: results.map(r => ({
      name: r.name,
      kind: r.kind,
      file: r.file,
      description: r.description,
      lineNumber: r.lineNumber,
    })),
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

/**
 * Get a specific type definition
 */
export async function handleGetType(
  args: z.infer<typeof toolSchemas.getType>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = await buildIndex();
  const typeDef = getTypeByName(index, args.name);

  if (!typeDef) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: `Type not found: ${args.name}` }, null, 2),
        },
      ],
    };
  }

  const categorized: CategorizedType = {
    ...typeDef,
    category: categorizeType(typeDef),
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(categorized, null, 2),
      },
    ],
  };
}

/**
 * List all type definitions
 */
export async function handleListTypes(
  args: z.infer<typeof toolSchemas.listTypes>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = await buildIndex();
  let typeNames = getAllTypeNames(index);

  // Apply filter if provided
  if (args.filter) {
    const filterLower = args.filter.toLowerCase();
    const types = typeNames.map(name => getTypeByName(index, name)).filter((t): t is TypeDefinition => t !== undefined);

    const filtered = types.filter(t => {
      const category = categorizeType(t);
      return (
        category.toLowerCase().includes(filterLower) ||
        t.file.toLowerCase().includes(filterLower) ||
        t.kind.toLowerCase().includes(filterLower)
      );
    });

    typeNames = filtered.map(t => t.name);
  }

  const output = {
    types: typeNames,
    count: typeNames.length,
    filter: args.filter,
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

/**
 * Get related types
 */
export async function handleGetRelated(
  args: z.infer<typeof toolSchemas.getRelated>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = await buildIndex();
  const typeDef = getTypeByName(index, args.name);

  if (!typeDef) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ error: `Type not found: ${args.name}` }, null, 2),
        },
      ],
    };
  }

  const related = typeDef.relatedTypes || [];
  const relatedDefs = related
    .map(name => getTypeByName(index, name))
    .filter((t): t is TypeDefinition => t !== undefined)
    .map(t => ({
      name: t.name,
      kind: t.kind,
      file: t.file,
      description: t.description,
    }));

  const output = {
    type: args.name,
    relatedTypes: relatedDefs,
    count: relatedDefs.length,
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}

/**
 * Get types from a specific file
 */
export async function handleGetByFile(
  args: z.infer<typeof toolSchemas.getByFile>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const index = await buildIndex();
  const types = getTypesByFile(index, args.fileName);

  const output = {
    file: args.fileName,
    types: types.map(t => ({
      name: t.name,
      kind: t.kind,
      description: t.description,
      lineNumber: t.lineNumber,
    })),
    count: types.length,
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(output, null, 2),
      },
    ],
  };
}
