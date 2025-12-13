#!/usr/bin/env node

/**
 * Documentation Build Script
 * 
 * This script aggregates markdown documentation from:
 * - Root docs/ directory
 * - All packages docs directories
 * 
 * It combines them into a structured wiki format that can be pushed
 * to the GitHub repository wiki.
 */

const fs = require('fs').promises;
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const OUTPUT_DIR = path.join(ROOT_DIR, 'wiki');

/**
 * Recursively find all markdown files in a directory
 * @param {string} dir - Directory to search
 * @param {string} baseDir - Base directory for calculating relative paths (defaults to dir)
 * @returns {Promise<Array<{fullPath: string, relativePath: string, name: string}>>} Array of file information
 */
async function findMarkdownFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findMarkdownFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        // Store relative path from base directory
        const relativePath = path.relative(baseDir, fullPath);
        files.push({
          fullPath,
          relativePath,
          name: entry.name
        });
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

/**
 * Get all package directories
 */
async function getPackages() {
  try {
    const entries = await fs.readdir(PACKAGES_DIR, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch (error) {
    console.warn(`Warning: Could not read packages directory: ${error.message}`);
    return [];
  }
}

/**
 * Create a sanitized filename for wiki pages
 * Converts markdown filenames to wiki-compatible format by:
 * - Removing .md extension
 * - Replacing invalid characters with hyphens
 * - Collapsing multiple hyphens
 * - Trimming leading/trailing hyphens
 * @param {string} name - Original filename to sanitize
 * @returns {string} Sanitized filename suitable for wiki links
 */
function sanitizeWikiFilename(name) {
  return name
    .replace(/\.md$/i, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a table of contents
 */
function generateTableOfContents(sections) {
  let toc = '# Documentation\n\n';
  toc += 'This documentation is automatically generated from the repository.\n\n';
  toc += '## Table of Contents\n\n';
  
  for (const section of sections) {
    toc += `### ${section.title}\n\n`;
    for (const file of section.files) {
      toc += `- [${file.title}](${file.wikiLink})\n`;
    }
    toc += '\n';
  }
  
  return toc;
}

/**
 * Process markdown content for wiki compatibility
 * Adds source file reference and converts relative markdown links to wiki-style links
 * @param {string} content - Original markdown content
 * @param {string} sourceFile - Path to the source file (for reference)
 * @returns {string} Processed markdown content
 * 
 * Transformations:
 * - Adds source reference header
 * - Converts ./file.md and ../file.md to wiki-style [text](WikiPageName) format
 */
function processMarkdownContent(content, sourceFile) {
  // Add source file reference at the top
  let processed = `> **Source:** \`${sourceFile}\`\n\n`;
  processed += content;
  
  // Fix relative links to other markdown files
  // Convert ./file.md or ../file.md to wiki-style links
  processed = processed.replace(
    /\[([^\]]+)\]\((?:\.\/|\.\.\/)?([^)]+\.md)\)/gi,
    (match, text, link) => {
      const wikiName = sanitizeWikiFilename(path.basename(link));
      return `[${text}](${wikiName})`;
    }
  );
  
  return processed;
}

/**
 * Main documentation build function
 */
async function buildDocs() {
  console.log('📚 Building documentation...\n');
  
  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const sections = [];
  
  // Process root docs
  console.log('📖 Processing root documentation...');
  const rootDocs = await findMarkdownFiles(DOCS_DIR);
  if (rootDocs.length > 0) {
    sections.push({
      title: 'General Documentation',
      files: rootDocs.map(doc => ({
        source: doc.fullPath,
        title: doc.name.replace(/\.md$/i, ''),
        wikiLink: sanitizeWikiFilename(doc.relativePath),
        wikiFilename: sanitizeWikiFilename(doc.relativePath) + '.md',
        relativePath: doc.relativePath
      }))
    });
    console.log(`  ✓ Found ${rootDocs.length} files`);
  }
  
  // Process package docs
  const packages = await getPackages();
  for (const pkg of packages) {
    const pkgDocsDir = path.join(PACKAGES_DIR, pkg, 'docs');
    console.log(`📦 Processing ${pkg} documentation...`);
    
    const pkgDocs = await findMarkdownFiles(pkgDocsDir);
    if (pkgDocs.length > 0) {
      sections.push({
        title: `Package: ${pkg}`,
        files: pkgDocs.map(doc => ({
          source: doc.fullPath,
          title: doc.name.replace(/\.md$/i, ''),
          wikiLink: sanitizeWikiFilename(`${pkg}-${doc.relativePath}`),
          wikiFilename: sanitizeWikiFilename(`${pkg}-${doc.relativePath}`) + '.md',
          relativePath: `packages/${pkg}/docs/${doc.relativePath}`
        }))
      });
      console.log(`  ✓ Found ${pkgDocs.length} files`);
    }
  }
  
  // Generate and write Home.md (table of contents)
  console.log('\n📝 Generating table of contents...');
  const toc = generateTableOfContents(sections);
  await fs.writeFile(path.join(OUTPUT_DIR, 'Home.md'), toc, 'utf8');
  console.log('  ✓ Created Home.md');
  
  // Copy and process all documentation files
  console.log('\n📋 Copying and processing documentation files...');
  let fileCount = 0;
  
  for (const section of sections) {
    for (const file of section.files) {
      const content = await fs.readFile(file.source, 'utf8');
      const processed = processMarkdownContent(content, file.relativePath);
      const outputPath = path.join(OUTPUT_DIR, file.wikiFilename);
      
      await fs.writeFile(outputPath, processed, 'utf8');
      fileCount++;
    }
  }
  
  console.log(`  ✓ Processed ${fileCount} documentation files\n`);
  
  // Generate a summary
  console.log('✅ Documentation build complete!\n');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Total sections: ${sections.length}`);
  console.log(`Total files: ${fileCount + 1} (including Home.md)\n`);
  
  // List all sections
  console.log('📚 Documentation structure:');
  for (const section of sections) {
    console.log(`  ${section.title}: ${section.files.length} files`);
  }
}

// Run the build
buildDocs().catch(error => {
  console.error('❌ Error building documentation:', error);
  process.exit(1);
});
