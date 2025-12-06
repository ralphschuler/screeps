/**
 * Parser for MediaWiki content to structured markdown
 */

import * as cheerio from "cheerio";
import type { WikiSection, WikiTable } from "../types.js";

/**
 * Parse MediaWiki wikitext to structured content
 * Converts wikitext syntax to plain markdown
 */
export function parseWikitext(wikitext: string): {
  content: string;
  sections: WikiSection[];
} {
  const sections: WikiSection[] = [];
  const lines = wikitext.split("\n");
  const outputLines: string[] = [];

  let currentSection: WikiSection | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    // Match section headings (== heading ==)
    const headingMatch = line.match(/^(={2,6})\s*(.+?)\s*\1$/);

    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = sectionContent.join("\n").trim();
        sections.push(currentSection);
        sectionContent = [];
      }

      const level = headingMatch[1].length;
      const heading = headingMatch[2];

      currentSection = {
        heading,
        level,
        content: "",
        anchor: heading.replace(/\s+/g, "_")
      };

      // Convert to markdown heading
      outputLines.push("#".repeat(level) + " " + heading);
    } else {
      // Process content line
      const processedLine = processWikitextLine(line);
      outputLines.push(processedLine);

      if (currentSection) {
        sectionContent.push(processedLine);
      }
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = sectionContent.join("\n").trim();
    sections.push(currentSection);
  }

  return {
    content: outputLines.join("\n").trim(),
    sections
  };
}

/**
 * Remove HTML comments iteratively to handle nested/malformed cases
 */
function removeHtmlComments(input: string): string {
  let result = input;
  let previous = "";
  while (result !== previous) {
    previous = result;
    result = result.replace(/<!--[\s\S]*?-->/g, "");
  }
  return result;
}

/**
 * Process a single line of wikitext
 */
function processWikitextLine(line: string): string {
  let result = line;

  // Remove categories first (before converting wiki links)
  result = result.replace(/\[\[Category:[^\]]+\]\]/g, "");

  // Remove template calls {{Template}} - simplified handling
  result = result.replace(/\{\{[^}]+\}\}/g, "");

  // Remove HTML comments iteratively to handle nested cases
  result = removeHtmlComments(result);

  // Convert wiki links [[Article]] or [[Article|Display Text]]
  result = result.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, article, display) => {
    // Link with display text: [[Article|Display Text]]
    return `[${display}](https://wiki.screepspl.us/index.php/${encodeURIComponent(article.replace(/ /g, "_"))})`;
  });
  result = result.replace(/\[\[([^\]]+)\]\]/g, (_, article) => {
    // Simple link: [[Article]]
    return `[${article}](https://wiki.screepspl.us/index.php/${encodeURIComponent(article.replace(/ /g, "_"))})`;
  });

  // Convert external links [url text] - only match links starting with http/https
  result = result.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, "[$2]($1)");

  // Convert bold text '''text'''
  result = result.replace(/'''([^']+)'''/g, "**$1**");

  // Convert italic text ''text''
  result = result.replace(/''([^']+)''/g, "*$1*");

  // Convert <code> tags to backticks
  result = result.replace(/<code>([^<]+)<\/code>/gi, "`$1`");
  result = result.replace(/<syntaxhighlight[^>]*>([^<]+)<\/syntaxhighlight>/gi, "```\n$1\n```");

  // Convert bullet lists (* item)
  if (/^\*+\s/.test(result)) {
    const depth = result.match(/^\*+/)?.[0].length || 1;
    result = "  ".repeat(depth - 1) + "- " + result.replace(/^\*+\s*/, "");
  }

  // Convert numbered lists (# item)
  if (/^#+\s/.test(result)) {
    const depth = result.match(/^#+/)?.[0].length || 1;
    result = "  ".repeat(depth - 1) + "1. " + result.replace(/^#+\s*/, "");
  }

  return result;
}

/**
 * Parse HTML content to extract structured text
 */
export function parseHtmlContent(html: string): {
  content: string;
  sections: WikiSection[];
  tables: WikiTable[];
} {
  const $ = cheerio.load(html);
  const sections: WikiSection[] = [];
  const tables: WikiTable[] = [];

  // Remove unwanted elements
  $("script, style, .mw-editsection, .toc, .navbox, .infobox").remove();

  // Extract sections
  $("h2, h3, h4, h5, h6").each((_, elem) => {
    const $elem = $(elem);
    const level = parseInt(elem.tagName.substring(1), 10);
    const heading = $elem.text().trim();

    // Get content until next heading
    const contentParts: string[] = [];
    let next = $elem.next();

    while (next.length && !/^h[1-6]$/i.test(next.prop("tagName") || "")) {
      if (next.is("p, ul, ol, pre, blockquote")) {
        contentParts.push(next.text().trim());
      }
      next = next.next();
    }

    if (heading) {
      sections.push({
        heading,
        level,
        content: contentParts.join("\n\n"),
        anchor: heading.replace(/\s+/g, "_")
      });
    }
  });

  // Extract tables
  $("table.wikitable, table.sortable").each((_, table) => {
    const $table = $(table);
    const caption = $table.find("caption").text().trim();
    const headers: string[] = [];
    const rows: string[][] = [];

    // Extract headers
    $table.find("tr:first-child th").each((_, th) => {
      headers.push($(th).text().trim());
    });

    // If no th elements, check first row for headers
    if (headers.length === 0) {
      $table.find("tr:first-child td").each((_, td) => {
        headers.push($(td).text().trim());
      });
    }

    // Extract rows
    $table.find("tr").each((index, tr) => {
      if (index === 0 && headers.length > 0) return; // Skip header row

      const row: string[] = [];
      $(tr)
        .find("td, th")
        .each((_, cell) => {
          row.push($(cell).text().trim());
        });

      if (row.length > 0) {
        rows.push(row);
      }
    });

    if (headers.length > 0 || rows.length > 0) {
      tables.push({
        caption: caption || undefined,
        headers,
        rows,
        sourceArticle: ""
      });
    }
  });

  // Extract main text content
  const textContent = $("body").text().replace(/\s+/g, " ").trim();

  return {
    content: textContent,
    sections,
    tables
  };
}

/**
 * Clean and normalize wiki content
 */
export function cleanContent(content: string): string {
  return content
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .trim();
}

/**
 * Extract code blocks from wiki content
 */
export function extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
  const codeBlocks: Array<{ language: string; code: string }> = [];

  // Match <syntaxhighlight> or <source> blocks
  const syntaxRegex =
    /<(?:syntaxhighlight|source)\s+lang=["']?(\w+)["']?[^>]*>([\s\S]*?)<\/(?:syntaxhighlight|source)>/gi;
  let match;

  while ((match = syntaxRegex.exec(content)) !== null) {
    const language = match[1];
    const code = match[2];
    if (language && code) {
      codeBlocks.push({
        language: language.toLowerCase(),
        code: code.trim()
      });
    }
  }

  // Match <pre> blocks
  const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  while ((match = preRegex.exec(content)) !== null) {
    const code = match[1];
    if (code) {
      codeBlocks.push({
        language: "text",
        code: code.trim()
      });
    }
  }

  return codeBlocks;
}

/**
 * Strip HTML tags from a string, handling nested/malformed tags
 */
function stripHtmlTagsIteratively(input: string): string {
  let result = input;
  let previous = "";
  // Loop until no more tags are found (handles nested cases like <scr<script>ipt>)
  while (result !== previous) {
    previous = result;
    result = result.replace(/<[^>]*>/g, "");
  }
  return result;
}

/**
 * Convert wiki content to plain text summary
 */
export function toPlainText(content: string, maxLength: number = 500): string {
  // Remove wiki markup
  let text = content
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, article, display) => display || article)
    .replace(/\[([^\s\]]+)\s+([^\]]+)\]/g, "$2")
    .replace(/'''([^']+)'''/g, "$1")
    .replace(/''([^']+)''/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/={2,6}[^=]+={2,6}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strip HTML tags iteratively to handle nested/malformed tags
  text = stripHtmlTagsIteratively(text);

  if (text.length > maxLength) {
    // Truncate and add ellipsis, ensuring we don't cut mid-word
    const truncated = text.substring(0, maxLength).replace(/\s+\S*$/, "");
    // Only add ellipsis if we actually truncated
    if (truncated.length < text.length) {
      text = truncated + "...";
    }
  }

  return text;
}
