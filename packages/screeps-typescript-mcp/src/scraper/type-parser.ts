/**
 * Parser for TypeScript type definitions from typed-screeps
 */

import { promises as fs } from "fs";
import { join, basename } from "path";
import type { TypeDefinition, TypeKind, TypeCategory } from "../types.js";

/**
 * Parse a TypeScript file and extract type definitions
 * 
 * Note: This is a simple regex-based parser that works well for the typed-screeps
 * codebase. For more complex scenarios, consider using the TypeScript Compiler API
 * for AST-based parsing which would handle edge cases like braces in strings/comments.
 * 
 * @param filePath Path to the TypeScript file
 * @returns Array of type definitions
 */
export async function parseTypeScriptFile(filePath: string): Promise<TypeDefinition[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const fileName = basename(filePath);
  const definitions: TypeDefinition[] = [];

  // Split content into lines for processing
  const lines = content.split("\n");

  // Regular expressions for different type definition patterns
  // Matches: interface Name<T> extends Base or export interface Name<T> extends Base
  const interfaceRegex = /^(?:export\s+)?interface\s+(\w+)(?:<[^>]+>)?(?:\s+extends\s+[^{]+)?/;
  // Matches: type Name = ... or export type Name = ... or export const Name = ...
  const typeRegex = /^(?:export\s+)?(?:type|const)\s+(\w+)(?:<[^>]+>)?\s*=/;
  // Matches: class Name<T> extends Base or export class Name or export abstract class Name
  const classRegex = /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:<[^>]+>)?(?:\s+(?:extends|implements)\s+[^{]+)?/;
  // Matches: enum Name or export enum Name
  const enumRegex = /^(?:export\s+)?enum\s+(\w+)/;
  // Matches: function name(...) or export function name(...) or export const name = (...) =>
  const functionRegex = /^(?:export\s+)?(?:function|const)\s+(\w+)(?:<[^>]+>)?\s*\(/;
  // Matches: namespace Name or export namespace Name or export module Name
  const namespaceRegex = /^(?:export\s+)?(?:namespace|module)\s+(\w+)/;

  let currentDefinition: TypeDefinition | null = null;
  let braceCount = 0;
  let startLine = 0;
  let description = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Collect JSDoc comments
    if (line.startsWith("/**")) {
      description = "";
      let j = i;
      while (j < lines.length) {
        const commentLine = lines[j].trim();
        if (commentLine.startsWith("*") && !commentLine.startsWith("/**") && !commentLine.startsWith("*/")) {
          description += commentLine.replace(/^\*\s*/, "") + "\n";
        }
        if (commentLine.includes("*/")) {
          break;
        }
        j++;
      }
      description = description.trim();
      continue;
    }

    // Skip empty lines and reset definition tracking when braces are balanced
    if (!line) {
      if (currentDefinition && braceCount === 0) {
        currentDefinition = null;
      }
      continue;
    }

    // Try to match different patterns
    let match;
    let kind: TypeKind | null = null;
    let name = "";

    if ((match = line.match(interfaceRegex))) {
      kind = "interface";
      name = match[1];
      startLine = i + 1;
    } else if ((match = line.match(classRegex))) {
      kind = "class";
      name = match[1];
      startLine = i + 1;
    } else if ((match = line.match(enumRegex))) {
      kind = "enum";
      name = match[1];
      startLine = i + 1;
    } else if ((match = line.match(typeRegex))) {
      kind = line.includes("const") ? "constant" : "type";
      name = match[1];
      startLine = i + 1;
    } else if ((match = line.match(functionRegex))) {
      kind = "function";
      name = match[1];
      startLine = i + 1;
    } else if ((match = line.match(namespaceRegex))) {
      kind = "namespace";
      name = match[1];
      startLine = i + 1;
    }

    if (kind && name) {
      // Start collecting the definition
      currentDefinition = {
        id: `${fileName}:${name}`,
        name,
        kind,
        content: "",
        description: description || undefined,
        file: fileName,
        lineNumber: startLine,
      };

      braceCount = 0;
      let contentLines: string[] = [];

      // Collect the full definition
      for (let j = i; j < lines.length; j++) {
        const defLine = lines[j];
        contentLines.push(defLine);

        // Count braces to know when definition ends
        for (const char of defLine) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }

        // For single-line definitions (types, constants)
        if ((kind === "type" || kind === "constant") && defLine.includes(";")) {
          i = j;
          break;
        }

        // For multi-line definitions
        if (braceCount === 0 && j > i && (defLine.includes("}") || defLine.includes(";"))) {
          i = j;
          break;
        }
      }

      currentDefinition.content = contentLines.join("\n").trim();
      definitions.push(currentDefinition);
      description = "";
      currentDefinition = null;
    }
  }

  return definitions;
}

/**
 * Parse all TypeScript files in the typed-screeps src directory
 * @param srcPath Path to the src directory
 * @returns Array of all type definitions
 */
export async function parseAllTypes(srcPath: string): Promise<TypeDefinition[]> {
  const files = await fs.readdir(srcPath);
  const tsFiles = files.filter(f => f.endsWith(".ts") && !f.endsWith(".test.ts"));

  const allDefinitions: TypeDefinition[] = [];

  for (const file of tsFiles) {
    const filePath = join(srcPath, file);
    try {
      const definitions = await parseTypeScriptFile(filePath);
      allDefinitions.push(...definitions);
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  }

  return allDefinitions;
}

/**
 * Categorize a type definition based on its name and file
 * @param definition Type definition to categorize
 * @returns Category of the type
 */
export function categorizeType(definition: TypeDefinition): TypeCategory {
  const name = definition.name.toLowerCase();
  const file = definition.file.toLowerCase();

  // Check file-based categories first (more specific)
  if (file.includes("constant") || file.includes("literal")) return "constants";
  if (file.includes("game")) return "game";
  if (file.includes("room")) return "room";
  if (file.includes("creep")) return "creep";
  if (file.includes("structure")) return "structure";
  if (file.includes("resource")) return "resource";
  if (file.includes("path")) return "pathfinding";
  if (file.includes("memory")) return "memory";
  if (file.includes("market")) return "market";
  if (file.includes("power")) return "power";
  if (file.includes("visual")) return "visual";

  // Then check name-based categories
  if (name.includes("game")) return "game";
  if (name.includes("room")) return "room";
  if (name.includes("creep")) return "creep";
  if (name.includes("structure")) return "structure";
  if (name.includes("resource") || name.includes("mineral")) return "resource";
  if (name.includes("path")) return "pathfinding";
  if (name.includes("memory")) return "memory";
  if (name.includes("market")) return "market";
  if (name.includes("power")) return "power";
  if (name.includes("constant")) return "constants";
  if (name.includes("visual")) return "visual";

  return "other";
}

/**
 * Extract related type names from a type definition
 * @param definition Type definition
 * @returns Array of related type names
 */
export function extractRelatedTypes(definition: TypeDefinition): string[] {
  const related = new Set<string>();
  const content = definition.content;

  // Extract types from extends/implements clauses
  const extendsMatch = content.match(/(?:extends|implements)\s+([^{]+)/);
  if (extendsMatch) {
    const types = extendsMatch[1].split(/[,\s]+/).filter(t => t && t !== "{");
    types.forEach(t => related.add(t));
  }

  // Extract type references (simple heuristic)
  // Note: This regex extracts TypeScript generic syntax like Type<...>, not HTML tags
  const typeRefs = content.match(/:\s*([A-Z]\w+)(?:<[^>]+>)?/g);
  if (typeRefs) {
    typeRefs.forEach(ref => {
      // Extract type name, removing TypeScript generic syntax (not HTML sanitization)
      const typeName = ref.replace(/:\s*/, "").replace(/<.*>/, "");
      if (typeName && typeName !== definition.name) {
        related.add(typeName);
      }
    });
  }

  return Array.from(related);
}

/**
 * Get list of all type names
 * @param definitions Array of type definitions
 * @returns Array of type names
 */
export function getTypeList(definitions: TypeDefinition[]): string[] {
  return definitions.map(d => d.name).sort();
}
