#!/usr/bin/env node
/**
 * Guard source imports from depending on built package internals.
 *
 * Framework packages expose stable APIs through their package roots or explicit
 * source subpaths. Source files must not import package dist internals because
 * that couples builds to generated artifacts and breaks clean workspace builds.
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

const repoRoot = process.cwd();
const sourceRoot = process.env.NO_DEEP_DIST_IMPORTS_PACKAGES_DIR
  ? path.resolve(process.env.NO_DEEP_DIST_IMPORTS_PACKAGES_DIR)
  : path.join(repoRoot, "packages");
const blockedSpecifierPattern = /^@ralphschuler\/[^/]+\/dist(?:\/|$)/;
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const excludedDirectories = new Set([
  ".git",
  ".turbo",
  "artifacts",
  "coverage",
  "dist",
  "node_modules",
  "reports",
]);

function scriptKindForFile(filePath) {
  switch (path.extname(filePath)) {
    case ".js":
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.TS;
  }
}

function collectSourceFiles(root) {
  const files = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!excludedDirectories.has(entry.name)) walk(fullPath);
        continue;
      }

      if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function collectModuleSpecifiers(filePath, source) {
  const ast = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    false,
    scriptKindForFile(filePath),
  );
  const specifiers = [];

  function add(moduleSpecifier) {
    if (moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)) {
      specifiers.push(moduleSpecifier.text);
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      add(node.moduleSpecifier);
    } else if (ts.isImportTypeNode(node)) {
      const argument = node.argument;
      if (ts.isLiteralTypeNode(argument)) add(argument.literal);
    } else if (ts.isModuleDeclaration(node)) {
      add(node.name);
    } else if (ts.isCallExpression(node)) {
      const [firstArg] = node.arguments;
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire =
        ts.isIdentifier(node.expression) && node.expression.text === "require";
      if ((isDynamicImport || isRequire) && firstArg) add(firstArg);
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  return specifiers;
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`Packages directory not found: ${sourceRoot}`);
  process.exit(1);
}

const violations = [];
for (const filePath of collectSourceFiles(sourceRoot)) {
  let source;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  for (const specifier of collectModuleSpecifiers(filePath, source)) {
    if (blockedSpecifierPattern.test(specifier)) {
      violations.push({ filePath, specifier });
    }
  }
}

if (violations.length > 0) {
  console.error("❌ Deep dist imports are not allowed in source files.");
  console.error("Use package roots or explicit public subpath exports instead.\n");
  for (const { filePath, specifier } of violations) {
    console.error(`${path.relative(repoRoot, filePath)} -> ${specifier}`);
  }
  process.exit(1);
}

console.log("✅ No @ralphschuler/*/dist source imports found.");
