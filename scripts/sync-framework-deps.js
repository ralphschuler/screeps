#!/usr/bin/env node
/**
 * Framework Package Dependency Synchronization Script
 *
 * This script ensures all @ralphschuler/screeps-* framework packages have
 * consistent devDependencies by reading from a shared configuration file
 * and updating all package.json files.
 *
 * Usage:
 *   node scripts/sync-framework-deps.js [--check]
 *
 * Options:
 *   --check    Only check for inconsistencies without modifying files
 */

import fs from "fs";
import path from "path";
import ts from "typescript";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to exit with error
function exitWithError(message) {
  console.error("");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("❌ ERROR");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("");
  console.error(message);
  console.error("");
  process.exit(1);
}

// Load shared dependencies configuration
const sharedDepsPath = process.env.FRAMEWORK_DEPS_SHARED_CONFIG
  ? path.resolve(process.env.FRAMEWORK_DEPS_SHARED_CONFIG)
  : path.join(__dirname, "shared-dependencies.json");

let sharedDepsConfig;
try {
  const configContent = fs.readFileSync(sharedDepsPath, "utf8");
  sharedDepsConfig = JSON.parse(configContent);
} catch (error) {
  if (error.code === "ENOENT") {
    exitWithError(
      `Shared dependencies file not found: ${sharedDepsPath}\nPlease create this file with framework devDependencies.`,
    );
  } else if (error instanceof SyntaxError) {
    exitWithError(
      `Invalid JSON in shared dependencies file: ${sharedDepsPath}\n${error.message}`,
    );
  } else {
    exitWithError(`Failed to read shared dependencies file: ${error.message}`);
  }
}

if (
  !sharedDepsConfig.framework ||
  !sharedDepsConfig.framework.devDependencies
) {
  exitWithError(
    `Invalid shared dependencies config: ${sharedDepsPath}\nMissing framework.devDependencies property.`,
  );
}

const sharedDevDeps = sharedDepsConfig.framework.devDependencies;

// Find all framework packages: any package.json under packages/ whose name starts with @ralphschuler/screeps-
// Excludes server, tasks, and posis packages which have different dependency requirements
const packagesDir = process.env.FRAMEWORK_DEPS_PACKAGES_DIR
  ? path.resolve(process.env.FRAMEWORK_DEPS_PACKAGES_DIR)
  : path.join(__dirname, "..", "packages");

if (!fs.existsSync(packagesDir)) {
  exitWithError(
    `Packages directory not found: ${packagesDir}\nExpected directory structure: packages/ containing @ralphschuler/screeps-* packages.`,
  );
}

/**
 * Recursively find all package.json files under a root directory whose
 * package name starts with @ralphschuler/screeps- but exclude non-framework packages.
 */
function findFrameworkPackageJsons(rootDir) {
  const results = [];
  const excludedPackages = [
    "@ralphschuler/screeps-server",
    "@ralphschuler/screeps-tasks",
    "@ralphschuler/screeps-posis",
  ];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      // Silently ignore directories we cannot read
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules directories
      if (entry.isDirectory() && entry.name === "node_modules") {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === "package.json") {
        try {
          const pkgContent = fs.readFileSync(fullPath, "utf8");
          const pkgJson = JSON.parse(pkgContent);
          if (
            typeof pkgJson.name === "string" &&
            pkgJson.name.startsWith("@ralphschuler/screeps-") &&
            !excludedPackages.includes(pkgJson.name)
          ) {
            results.push(fullPath);
          }
        } catch {
          // Silently ignore unreadable or invalid package.json files
        }
      }
    }
  }

  walk(rootDir);
  return results;
}

const SOURCE_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const SOURCE_DIR_EXCLUDES = new Set([
  "node_modules",
  "dist",
  "coverage",
  "test",
  "tests",
  "__tests__",
]);
function sortObjectByKey(value) {
  return Object.fromEntries(
    Object.entries(value ?? {}).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function extractPackageName(specifier) {
  if (
    typeof specifier !== "string" ||
    specifier.startsWith(".") ||
    specifier.startsWith("/")
  ) {
    return null;
  }
  const parts = specifier.split("/");
  if (specifier.startsWith("@")) {
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }
  return parts[0] || null;
}

function findSourceFiles(packageRoot) {
  const srcDir = path.join(packageRoot, "src");
  const root = fs.existsSync(srcDir) ? srcDir : packageRoot;
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
        if (!SOURCE_DIR_EXCLUDES.has(entry.name)) walk(fullPath);
        continue;
      }
      if (entry.isFile() && SOURCE_FILE_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function scriptKindForFile(sourceFile) {
  switch (path.extname(sourceFile)) {
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

function collectImportSpecifiers(sourceFile, source) {
  const ast = ts.createSourceFile(
    sourceFile,
    source,
    ts.ScriptTarget.Latest,
    false,
    scriptKindForFile(sourceFile),
  );
  const specifiers = [];

  function addModuleSpecifier(moduleSpecifier) {
    if (moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)) {
      specifiers.push(moduleSpecifier.text);
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addModuleSpecifier(node.moduleSpecifier);
    } else if (ts.isCallExpression(node)) {
      const [firstArg] = node.arguments;
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === "require";
      if ((isDynamicImport || isRequire) && firstArg) addModuleSpecifier(firstArg);
    }
    ts.forEachChild(node, visit);
  }

  visit(ast);
  return specifiers;
}

function collectInternalImports(packageRoot, internalPackageNames) {
  const imports = new Set();
  for (const sourceFile of findSourceFiles(packageRoot)) {
    let source;
    try {
      source = fs.readFileSync(sourceFile, "utf8");
    } catch {
      continue;
    }

    for (const specifier of collectImportSpecifiers(sourceFile, source)) {
      const packageName = extractPackageName(specifier);
      if (packageName && internalPackageNames.has(packageName)) imports.add(packageName);
    }
  }
  return imports;
}

function collectDeclaredPackageDependencies(pkg) {
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ]);
}

function findMissingInternalDependencies(pkgPath, pkg, internalPackageNames) {
  const importedPackages = collectInternalImports(
    path.dirname(pkgPath),
    internalPackageNames,
  );
  const declaredPackages = collectDeclaredPackageDependencies(pkg);
  importedPackages.delete(pkg.name);
  return [...importedPackages]
    .filter((packageName) => !declaredPackages.has(packageName))
    .sort();
}

function loadInternalPackageNames(packageJsonPaths) {
  const names = new Set();
  for (const pkgPath of packageJsonPaths) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (typeof pkg.name === "string") names.add(pkg.name);
    } catch {
      // Invalid package files are handled in the main package loop.
    }
  }
  return names;
}

let packageDirs;
try {
  packageDirs = findFrameworkPackageJsons(packagesDir);
} catch (error) {
  exitWithError(`Failed to scan packages directory: ${error.message}`);
}

if (packageDirs.length === 0) {
  exitWithError(
    `No framework packages found in: ${packagesDir}\nExpected at least one package with name starting with @ralphschuler/screeps-.`,
  );
}

const internalPackageNames = loadInternalPackageNames(packageDirs);

// Check if running in check-only mode
const checkOnly = process.argv.includes("--check");

let hasInconsistencies = false;
let updatedCount = 0;

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Framework Package Dependency Synchronization");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log(`Mode: ${checkOnly ? "CHECK ONLY" : "SYNC"}`);
console.log(`Found ${packageDirs.length} framework packages`);
console.log("");

packageDirs.forEach((pkgPath) => {
  let pkg;
  try {
    const pkgContent = fs.readFileSync(pkgPath, "utf8");
    pkg = JSON.parse(pkgContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`⚠️  Skipping ${pkgPath}: Invalid JSON - ${error.message}`);
    } else {
      console.error(`⚠️  Skipping ${pkgPath}: ${error.message}`);
    }
    return;
  }

  const packageName = pkg.name;
  const relativePath = path.relative(process.cwd(), pkgPath);

  // Initialize devDependencies if it doesn't exist
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  // Check for inconsistencies
  const inconsistencies = [];

  // Check for missing or outdated shared dependencies
  for (const [depName, depVersion] of Object.entries(sharedDevDeps)) {
    const currentVersion = pkg.devDependencies[depName];

    if (!currentVersion) {
      inconsistencies.push(`  + ${depName}: ${depVersion} (missing)`);
    } else if (currentVersion !== depVersion) {
      inconsistencies.push(
        `  ~ ${depName}: ${currentVersion} → ${depVersion} (outdated)`,
      );
    }
  }

  // Check for missing internal workspace package declarations. Framework packages
  // should be independently buildable/publishable from their package manifests.
  const missingInternalDependencies = findMissingInternalDependencies(
    pkgPath,
    pkg,
    internalPackageNames,
  );
  for (const depName of missingInternalDependencies) {
    inconsistencies.push(
      `  + ${depName}: * (missing internal workspace dependency)`,
    );
  }

  // Check for dependencies that are in package but not in shared config
  // These might be package-specific dependencies or removed shared dependencies
  const sharedDepNames = Object.keys(sharedDevDeps);
  for (const depName of Object.keys(pkg.devDependencies)) {
    if (!sharedDepNames.includes(depName)) {
      // This is either a package-specific dependency (keep it) or a removed shared dependency
      // We don't flag this as an inconsistency since we preserve package-specific deps
    }
  }

  if (inconsistencies.length > 0) {
    hasInconsistencies = true;
    console.log(`📦 ${packageName}`);
    console.log(`   ${relativePath}`);
    inconsistencies.forEach((msg) => console.log(msg));
    console.log("");

    if (!checkOnly) {
      // Merge shared devDependencies (preserving package-specific deps)
      // Note: If a dependency is removed from shared-dependencies.json,
      // it will persist in package.json files as a package-specific dependency.
      // To fully remove a shared dependency, manually delete it from each package.json
      // or modify this script to track and remove explicitly removed dependencies.
      pkg.devDependencies = {
        ...pkg.devDependencies,
        ...sharedDevDeps,
      };

      if (missingInternalDependencies.length > 0) {
        pkg.dependencies = {
          ...(pkg.dependencies ?? {}),
        };
        for (const depName of missingInternalDependencies) {
          pkg.dependencies[depName] = "*";
        }
        pkg.dependencies = sortObjectByKey(pkg.dependencies);
      }

      // Sort devDependencies alphabetically for consistency
      pkg.devDependencies = sortObjectByKey(pkg.devDependencies);

      // Write back to file with consistent formatting
      try {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
        updatedCount++;
        console.log(`   ✅ Updated`);
        console.log("");
      } catch (error) {
        console.error(`   ❌ Failed to write: ${error.message}`);
        console.error("");
      }
    }
  }
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Summary");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");

if (checkOnly) {
  if (hasInconsistencies) {
    console.log("❌ FAIL: Found dependency inconsistencies");
    console.log("");
    console.log("Run `npm run sync:deps` to synchronize all packages");
    process.exit(1);
  } else {
    console.log("✅ PASS: All framework packages have consistent dependencies");
  }
} else {
  if (updatedCount > 0) {
    console.log(`✨ Synchronized ${updatedCount} framework packages`);
    console.log("");
    console.log("All packages now have consistent devDependencies from:");
    console.log(`   ${sharedDepsPath}`);
  } else {
    console.log("✅ All packages already synchronized");
  }
}

console.log("");
