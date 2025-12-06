# Screeps Wiki MCP Server

Model Context Protocol (MCP) server for accessing the [Screeps community wiki](https://wiki.screepspl.us/). Enables AI agents to search, browse, and retrieve content from the wiki for development assistance.

## Features

- **🔍 Wiki Search**: Full-text search across all wiki articles
- **📄 Article Retrieval**: Get full article content parsed to markdown
- **📁 Category Browsing**: Navigate wiki categories and their contents
- **📊 Table Extraction**: Extract structured data from wiki tables as JSON
- **⚡ Caching**: In-memory caching with configurable TTL to reduce API calls
- **🔧 MCP Tools**: Programmatic access via MCP protocol for AI-assisted development

## Installation

```bash
npm install @ralphschuler/screeps-wiki-mcp
```

## Usage

### As MCP Server

Configure in your MCP client (e.g., Claude Desktop, GitHub Copilot):

```json
{
  "mcpServers": {
    "screeps-wiki": {
      "command": "npx",
      "args": ["-y", "@ralphschuler/screeps-wiki-mcp@latest"],
      "env": {
        "WIKI_CACHE_TTL": "3600"
      }
    }
  }
}
```

### Docker Usage

The MCP server is available as a Docker image for containerized deployments.

**Pull from GHCR:**

```bash
docker pull ghcr.io/ralphschuler/screeps-wiki-mcp:latest
```

**Run with environment variables:**

```bash
docker run --rm -i \
  -e WIKI_CACHE_TTL=3600 \
  ghcr.io/ralphschuler/screeps-wiki-mcp:latest
```

**Build locally:**

```bash
cd packages/screeps-wiki-mcp
npm run docker:build
npm run docker:run
```

### Docker stdio Transport Configuration

For MCP clients like Claude Desktop or Cursor, configure the Docker-based server:

```json
{
  "mcpServers": {
    "screeps-wiki-docker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "WIKI_CACHE_TTL=${WIKI_CACHE_TTL:-3600}",
        "ghcr.io/ralphschuler/screeps-wiki-mcp:latest"
      ]
    }
  }
}
```

### Programmatic Usage

```typescript
import { searchWiki, getArticleContent, parseWikitext } from "@ralphschuler/screeps-wiki-mcp";

// Search for articles
const results = await searchWiki("remote harvesting", 10);
console.log(results);
// [{ title: "Remote Harvesting", pageId: 123, snippet: "..." }, ...]

// Get article content
const article = await getArticleContent("Overmind");
const parsed = parseWikitext(article.content);
console.log(parsed.sections);

// List categories
import { listCategories, getCategoryMembers } from "@ralphschuler/screeps-wiki-mcp";
const categories = await listCategories();
const bots = await getCategoryMembers("Bots");
```

## MCP Resources

The server exposes the following resources:

- `screeps-wiki://categories/list` - List all wiki categories
- `screeps-wiki://article/{title}` - Get specific article (e.g., `screeps-wiki://article/Overmind`)
- `screeps-wiki://category/{name}` - List articles in a category (e.g., `screeps-wiki://category/Bots`)

## MCP Tools

The server provides the following tools:

### screeps_wiki_search

Search the wiki for articles by keyword.

```json
{
  "query": "remote harvesting",
  "limit": 10
}
```

**Returns:** List of matching articles with titles, URLs, and snippets.

### screeps_wiki_get_article

Get the full content of a specific article.

```json
{
  "title": "Overmind",
  "includeHtml": false
}
```

**Returns:** Article content parsed to markdown, sections, categories, and summary.

### screeps_wiki_list_categories

List wiki categories or articles within a category.

```json
{
  "parent": "Bots",
  "limit": 50
}
```

**Returns:** List of categories or articles in the specified category.

### screeps_wiki_get_table

Extract structured table data from an article.

```json
{
  "article": "Market",
  "tableIndex": 0
}
```

**Returns:** Table headers and rows as JSON for data analysis.

## Configuration

### Environment Variables

- `WIKI_CACHE_TTL` - Cache time-to-live in seconds (default: 3600)

## Example Use Cases

### Research Bot Architectures

```typescript
// Search for bot-related articles
const bots = await handleSearch({ query: "bot architecture" });

// Get details about Overmind
const overmind = await handleGetArticle({ title: "Overmind" });
```

### Explore Great Filters

```typescript
// Get the Great Filters article for strategic insights
const filters = await handleGetArticle({ title: "Great Filters" });
```

### Browse Categories

```typescript
// List all categories
const categories = await handleListCategories({});

// Get articles in Strategies category
const strategies = await handleListCategories({ parent: "Strategies" });
```

### Extract Data Tables

```typescript
// Get mineral pricing table
const priceTable = await handleGetTable({
  article: "Market",
  tableIndex: 0
});
```

## Wiki Source

Content is retrieved from the Screeps community wiki:

- **URL**: https://wiki.screepspl.us/
- **API**: MediaWiki API at https://wiki.screepspl.us/api.php
- **Content**: Community strategies, bot architectures, optimization patterns, game mechanics

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run MCP Inspector tests (protocol compliance)
npm run test:inspector
```

### MCP Inspector Testing

This package includes integration tests that use the MCP SDK client to validate protocol compliance. The tests are inspired by the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) approach.

**Interactive inspection:**

```bash
# Launch the MCP Inspector UI (requires Node.js 22.7.5+)
npm run inspect

# CLI mode for quick testing
npm run inspect:cli
```

**Note:** The `inspect` command requires Node.js 22.7.5 or higher. The automated tests (`test:inspector`) work with Node.js 18+.

## License

MIT

## Related Packages

- [@ralphschuler/screeps-mcp](https://github.com/ralphschuler/.screeps-gpt/tree/main/packages/screeps-mcp) - MCP server for live Screeps game API integration
- [@ralphschuler/screeps-docs-mcp](https://github.com/ralphschuler/.screeps-gpt/tree/main/packages/screeps-docs-mcp) - MCP server for official Screeps documentation
- [@ralphschuler/screeps-agent](https://github.com/ralphschuler/.screeps-gpt/tree/main/packages/screeps-agent) - Autonomous Screeps AI development agent
