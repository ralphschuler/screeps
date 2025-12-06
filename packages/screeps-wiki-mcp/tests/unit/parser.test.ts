/**
 * Unit tests for wiki parser
 */

import { describe, it, expect } from "vitest";
import {
  parseWikitext,
  parseHtmlContent,
  cleanContent,
  extractCodeBlocks,
  toPlainText
} from "../../src/wiki/parser.js";

describe("Wiki Parser", () => {
  describe("parseWikitext", () => {
    it("should parse section headings", () => {
      const wikitext = "== Overview ==\nSome content here.\n\n=== Details ===\nMore details.";
      const result = parseWikitext(wikitext);

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].heading).toBe("Overview");
      expect(result.sections[0].level).toBe(2);
      expect(result.sections[1].heading).toBe("Details");
      expect(result.sections[1].level).toBe(3);
    });

    it("should convert headings to markdown", () => {
      const wikitext = "== Overview ==\nContent";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("## Overview");
    });

    it("should convert wiki links to markdown", () => {
      const wikitext = "See [[Overmind]] for more info.";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("[Overmind]");
      expect(result.content).toContain("https://wiki.screepspl.us");
    });

    it("should handle wiki links with display text", () => {
      const wikitext = "See [[Overmind|the Overmind bot]] for more info.";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("[the Overmind bot]");
    });

    it("should convert bold text", () => {
      const wikitext = "This is '''bold''' text.";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("**bold**");
    });

    it("should convert italic text", () => {
      const wikitext = "This is ''italic'' text.";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("*italic*");
    });

    it("should convert bullet lists", () => {
      const wikitext = "* Item 1\n* Item 2\n** Nested item";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("- Item 1");
      expect(result.content).toContain("- Item 2");
      expect(result.content).toContain("  - Nested item");
    });

    it("should convert numbered lists", () => {
      const wikitext = "# First\n# Second\n## Nested";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("1. First");
      expect(result.content).toContain("1. Second");
      expect(result.content).toContain("  1. Nested");
    });

    it("should convert code tags to backticks", () => {
      const wikitext = "Use <code>Game.time</code> to get the current tick.";
      const result = parseWikitext(wikitext);

      expect(result.content).toContain("`Game.time`");
    });

    it("should remove category links", () => {
      const wikitext = "Some content.\n[[Category:Bots]]";
      const result = parseWikitext(wikitext);

      expect(result.content).not.toContain("Category:Bots");
    });

    it("should remove template calls", () => {
      const wikitext = "Some content {{Template|param=value}}.";
      const result = parseWikitext(wikitext);

      expect(result.content).not.toContain("{{");
      expect(result.content).not.toContain("}}");
    });
  });

  describe("parseHtmlContent", () => {
    it("should extract sections from HTML", () => {
      const html = "<div><h2>Overview</h2><p>Some content.</p><h3>Details</h3><p>More details.</p></div>";
      const result = parseHtmlContent(html);

      expect(result.sections.length).toBeGreaterThanOrEqual(1);
    });

    it("should extract tables from HTML", () => {
      const html = `
        <table class="wikitable">
          <tr><th>Header 1</th><th>Header 2</th></tr>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = parseHtmlContent(html);

      expect(result.tables).toHaveLength(1);
      expect(result.tables[0].headers).toContain("Header 1");
      expect(result.tables[0].rows[0]).toContain("Cell 1");
    });

    it("should extract text content from HTML", () => {
      const html = "<div><p>Hello world.</p></div>";
      const result = parseHtmlContent(html);

      expect(result.content).toContain("Hello world");
    });
  });

  describe("cleanContent", () => {
    it("should normalize whitespace", () => {
      const content = "Multiple   spaces   here";
      const result = cleanContent(content);

      expect(result).not.toContain("   ");
    });

    it("should trim content", () => {
      const content = "   trimmed   ";
      const result = cleanContent(content);

      expect(result).toBe("trimmed");
    });

    it("should limit consecutive newlines", () => {
      const content = "Line 1\n\n\n\n\nLine 2";
      const result = cleanContent(content);

      expect(result).not.toContain("\n\n\n");
    });
  });

  describe("extractCodeBlocks", () => {
    it("should extract syntaxhighlight blocks", () => {
      const content = '<syntaxhighlight lang="javascript">const x = 1;</syntaxhighlight>';
      const result = extractCodeBlocks(content);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("javascript");
      expect(result[0].code).toBe("const x = 1;");
    });

    it("should extract source blocks", () => {
      const content = '<source lang="typescript">const y: number = 2;</source>';
      const result = extractCodeBlocks(content);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("typescript");
    });

    it("should extract pre blocks", () => {
      const content = "<pre>Some preformatted text</pre>";
      const result = extractCodeBlocks(content);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("text");
      expect(result[0].code).toBe("Some preformatted text");
    });

    it("should extract multiple code blocks", () => {
      const content = `
        <syntaxhighlight lang="javascript">code1</syntaxhighlight>
        <pre>code2</pre>
      `;
      const result = extractCodeBlocks(content);

      expect(result).toHaveLength(2);
    });
  });

  describe("toPlainText", () => {
    it("should remove wiki links", () => {
      const content = "See [[Overmind]] for details.";
      const result = toPlainText(content);

      expect(result).toContain("Overmind");
      expect(result).not.toContain("[[");
      expect(result).not.toContain("]]");
    });

    it("should handle display text in links", () => {
      const content = "See [[Overmind|the bot]].";
      const result = toPlainText(content);

      expect(result).toContain("the bot");
    });

    it("should remove formatting", () => {
      const content = "'''Bold''' and ''italic'' text.";
      const result = toPlainText(content);

      expect(result).toContain("Bold");
      expect(result).not.toContain("'''");
    });

    it("should truncate to max length", () => {
      const content = "A".repeat(1000);
      const result = toPlainText(content, 100);

      expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(result).toMatch(/\.\.\.$/);
    });

    it("should remove HTML tags", () => {
      const content = "<p>Paragraph</p> and <code>code</code>.";
      const result = toPlainText(content);

      expect(result).toContain("Paragraph");
      expect(result).not.toContain("<p>");
      expect(result).not.toContain("</p>");
    });
  });
});
