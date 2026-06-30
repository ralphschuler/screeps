/**
 * Pure help-formatting helpers for console commands.
 *
 * The registry owns command lifecycle and lazy loading. This module owns only
 * deterministic string rendering so help output stays easy to test and audit.
 */

const DEFAULT_CATEGORY = "General";

/** Minimal command shape required to render console help. */
export interface HelpCommand {
  metadata: {
    name: string;
    description: string;
    usage?: string;
    examples?: readonly string[];
    category?: string;
  };
}

export type HelpCategoryMap = ReadonlyMap<string, readonly HelpCommand[]>;

/** Sorts categories with the default General bucket first, then alphabetically. */
export function compareHelpCategories(a: string, b: string): number {
  if (a === b) return 0;
  if (a === DEFAULT_CATEGORY) return -1;
  if (b === DEFAULT_CATEGORY) return 1;
  return a.localeCompare(b);
}

/** Renders the complete help listing grouped by category. */
export function formatRegistryHelp(categories: HelpCategoryMap): string {
  const lines: string[] = ["=== Available Console Commands ===", ""];
  const sortedCategories = Array.from(categories.keys()).sort(compareHelpCategories);

  for (const category of sortedCategories) {
    const commands = categories.get(category);
    if (!commands || commands.length === 0) continue;

    lines.push(`--- ${category} ---`);

    for (const command of sortCommandsByName(commands)) {
      appendCommandSummary(lines, command);
    }
  }

  return lines.join("\n");
}

/** Renders detailed help for a single command. */
export function formatCommandHelp(command: HelpCommand): string {
  const { metadata } = command;
  const lines: string[] = [
    `=== ${metadata.name} ===`,
    "",
    `Description: ${metadata.description}`,
    `Usage: ${getUsage(metadata.name, metadata.usage)}`,
    `Category: ${metadata.category ?? DEFAULT_CATEGORY}`
  ];

  appendExamples(lines, metadata.examples, "  ");

  return lines.join("\n");
}

function appendCommandSummary(lines: string[], command: HelpCommand): void {
  const { metadata } = command;

  lines.push(`  ${getUsage(metadata.name, metadata.usage)}`);
  lines.push(`    ${metadata.description}`);
  appendExamples(lines, metadata.examples, "      ", "    Examples:", false);
  lines.push("");
}

function appendExamples(
  lines: string[],
  examples: readonly string[] | undefined,
  indent: string,
  heading = "Examples:",
  blankBefore = true
): void {
  if (!examples || examples.length === 0) return;

  if (blankBefore) lines.push("");
  lines.push(heading);
  for (const example of examples) {
    lines.push(`${indent}${example}`);
  }
}

function getUsage(name: string, usage: string | undefined): string {
  return usage ?? `${name}()`;
}

function sortCommandsByName(commands: readonly HelpCommand[]): HelpCommand[] {
  return [...commands].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
}
