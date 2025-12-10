/**
 * Markdown parser for Screeps documentation
 */

/**
 * Maximum description length for properties and methods
 */
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Extract front matter from markdown content
 */
export function extractFrontMatter(content: string): { frontMatter: Record<string, string>; body: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, body: content };
  }

  const [, frontMatterText, body] = match;
  const frontMatter: Record<string, string> = {};

  // Parse simple key: value pairs
  const lines = frontMatterText.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontMatter[key] = value;
    }
  }

  return { frontMatter, body };
}

/**
 * Remove markdown formatting to get plain text
 */
export function stripMarkdown(content: string): string {
  return content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "")
    // Remove bold/italic
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
    // Remove headers
    .replace(/^#+\s+/gm, "")
    // Remove HTML tags (multiple passes to handle nested/malformed tags)
    .replace(/<[^>]+>/g, "")
    .replace(/<[^>]+>/g, "")
    // Remove any remaining angle brackets that could be part of incomplete tags
    .replace(/[<>]/g, "")
    // Remove liquid/jekyll tags
    .replace(/\{%[\s\S]*?%\}/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract title from markdown content
 * Priority: front matter title > first h1 heading > filename
 */
export function extractTitle(content: string, filename: string): string {
  const { frontMatter, body } = extractFrontMatter(content);

  // Check front matter
  if (frontMatter.title) {
    return frontMatter.title;
  }

  // Check for first h1 heading
  const h1Match = body.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fall back to filename without extension
  return filename.replace(/\.md$/, "");
}

/**
 * Extract sections from markdown content
 */
export function extractSections(content: string): Array<{ heading: string; content: string }> {
  const { body } = extractFrontMatter(content);
  const sections: Array<{ heading: string; content: string }> = [];

  // Split by h2 and h3 headings
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const matches = Array.from(body.matchAll(headingRegex));

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[2].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : body.length;
    const sectionContent = body.substring(startIndex, endIndex).trim();

    if (sectionContent) {
      sections.push({ heading, content: stripMarkdown(sectionContent) });
    }
  }

  return sections;
}

/**
 * Parse API properties from markdown content
 * Looks for property definitions in Jekyll liquid tag format:
 * {% api_property PropertyName 'TypeString' %}
 * 
 * Capture groups:
 * [1] = Property name (e.g., "Game.constructionSites")
 * [2] = Type annotation in quotes
 * [3] = Property description and content until next tag
 */
export function extractAPIProperties(content: string): Array<{ name: string; type: string; description: string }> {
  const properties: Array<{ name: string; type: string; description: string }> = [];
  const propertyRegex = /\{%\s+api_property\s+([^\s]+)\s+['"]([^'"]+)['"]\s+%\}([\s\S]*?)(?=\{%|$)/g;

  let match;
  while ((match = propertyRegex.exec(content)) !== null) {
    const name = match[1].replace(/^[^.]+\./, ""); // Remove object prefix (e.g., "Game." -> "")
    const type = match[2];
    const description = stripMarkdown(match[3]).substring(0, MAX_DESCRIPTION_LENGTH);

    properties.push({ name, type, description });
  }

  return properties;
}

/**
 * Parse API methods from markdown content
 * Looks for method definitions in Jekyll liquid tag format:
 * {% api_method methodName 'optionalSignature' %}
 * 
 * Capture groups:
 * [1] = Method name (e.g., "Creep.moveTo")
 * [2] = Optional signature string in quotes
 * [3] = Method description and content until next tag (greedy match)
 */
export function extractAPIMethods(content: string): Array<{ name: string; signature: string; description: string; returns: string }> {
  const methods: Array<{ name: string; signature: string; description: string; returns: string }> = [];
  const methodRegex = /\{%\s+api_method\s+([^\s]+)(?:\s+['"]([^'"]*)['"]\s*)?%\}([\s\S]*?)(?=\{%|$)/g;

  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const name = match[1].replace(/^[^.]+\./, ""); // Remove object prefix
    const signature = match[2] || "";
    const methodContent = match[3];
    
    // Extract return value if present
    const returnMatch = methodContent.match(/returns?:?\s*([^\n]+)/i);
    const returns = returnMatch ? stripMarkdown(returnMatch[1]) : "";
    
    const description = stripMarkdown(methodContent).substring(0, MAX_DESCRIPTION_LENGTH);

    methods.push({ name, signature, description, returns });
  }

  return methods;
}
