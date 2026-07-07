#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEPENDENCY_SECTIONS = [
  "dependencies",
  "peerDependencies",
  "optionalDependencies",
  "devDependencies",
];
const INTERNAL_PACKAGE_PREFIX = "@ralphschuler/screeps-";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.PUBLISH_FRAMEWORK_REPO_ROOT
  ? path.resolve(process.env.PUBLISH_FRAMEWORK_REPO_ROOT)
  : path.resolve(scriptDir, "..");
const packagesRoot = process.env.PUBLISH_FRAMEWORK_PACKAGES_DIR
  ? path.resolve(process.env.PUBLISH_FRAMEWORK_PACKAGES_DIR)
  : path.join(repoRoot, "packages");

function usage() {
  return `Usage:
  node scripts/publish-framework-package.mjs --package <name-or-path> [--check|--dry-run|--publish]
  node scripts/publish-framework-package.mjs --all --check

Options:
  --package <name-or-path>  Package name or package directory to stage.
  --all                     Stage all public framework packages with main/types entries.
  --check                   Pack staged package and fail on publish-time dependency issues (default).
  --dry-run                 Run npm publish --dry-run for the normalized tarball.
  --publish                 Run npm publish for the normalized tarball.
  --access <value>          npm access flag for publish/dry-run (default: public).
  --provenance              Pass --provenance to real npm publish.
  --stage-root <dir>        Directory for temporary staging artifacts.
  --keep-stage              Keep staging artifacts after completion.
  --json                    Print machine-readable summary JSON after text logs.
`;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {
    packages: [],
    all: false,
    mode: "check",
    access: "public",
    provenance: false,
    keepStage: false,
    json: false,
    stageRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--package":
      case "--pkg": {
        const value = argv[index + 1];
        if (!value) fail(`${arg} requires a value.\n${usage()}`);
        args.packages.push(value);
        index += 1;
        break;
      }
      case "--all":
        args.all = true;
        break;
      case "--check":
        args.mode = "check";
        break;
      case "--dry-run":
        args.mode = "dry-run";
        break;
      case "--publish":
        args.mode = "publish";
        break;
      case "--access": {
        const value = argv[index + 1];
        if (!value) fail("--access requires a value.");
        args.access = value;
        index += 1;
        break;
      }
      case "--provenance":
        args.provenance = true;
        break;
      case "--keep-stage":
        args.keepStage = true;
        break;
      case "--json":
        args.json = true;
        break;
      case "--stage-root": {
        const value = argv[index + 1];
        if (!value) fail("--stage-root requires a value.");
        args.stageRoot = path.resolve(value);
        index += 1;
        break;
      }
      case "--help":
      case "-h":
        console.log(usage());
        process.exit(0);
        break;
      default:
        fail(`Unknown option: ${arg}\n${usage()}`);
    }
  }

  if (!args.all && args.packages.length === 0) {
    fail(`Select --all or at least one --package.\n${usage()}`);
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function findPackageJsons(rootDir) {
  const results = [];

  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && entry.name === "package.json") {
        results.push(entryPath);
      }
    }
  }

  walk(rootDir);
  return results;
}

function loadWorkspacePackages() {
  const packageByName = new Map();
  for (const manifestPath of findPackageJsons(packagesRoot)) {
    const manifest = readJson(manifestPath);
    if (typeof manifest.name !== "string") continue;
    packageByName.set(manifest.name, {
      dir: path.dirname(manifestPath),
      manifest,
      name: manifest.name,
      private: manifest.private === true,
      version: manifest.version,
    });
  }
  return packageByName;
}

function isFrameworkPublishCandidate(workspacePackage) {
  const manifest = workspacePackage.manifest;
  return (
    workspacePackage.name.startsWith(INTERNAL_PACKAGE_PREFIX) &&
    manifest.private !== true &&
    typeof manifest.main === "string" &&
    typeof manifest.types === "string"
  );
}

function resolvePackage(selection, packageByName) {
  if (packageByName.has(selection)) return packageByName.get(selection);

  const candidates = [
    path.resolve(process.cwd(), selection),
    path.resolve(repoRoot, selection),
  ];
  for (const candidate of candidates) {
    const manifestPath = path.join(candidate, "package.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    return {
      dir: candidate,
      manifest,
      name: manifest.name,
      private: manifest.private === true,
      version: manifest.version,
    };
  }

  fail(`Unable to resolve package selection: ${selection}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });

  if (result.status !== 0) {
    const detail = [
      `${command} ${args.join(" ")} failed with status ${result.status}`,
      result.stdout,
      result.stderr,
    ]
      .filter(Boolean)
      .join("\n");
    throw new Error(detail);
  }

  return result;
}

function parseNpmPackJson(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) throw new Error("npm pack returned no JSON output.");
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("npm pack JSON did not contain a package entry.");
    }
    return parsed[0];
  } catch (error) {
    throw new Error(`Failed to parse npm pack JSON output: ${error.message}\n${stdout}`);
  }
}

function packPackage(packageDir, packDestination) {
  mkdirSync(packDestination, { recursive: true });
  const result = run(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", packDestination],
    { cwd: packageDir },
  );
  const packInfo = parseNpmPackJson(result.stdout);
  const tarballPath = path.isAbsolute(packInfo.filename)
    ? packInfo.filename
    : path.resolve(packDestination, packInfo.filename);
  if (!existsSync(tarballPath)) {
    throw new Error(`npm pack did not create expected tarball: ${tarballPath}`);
  }
  return tarballPath;
}

function extractPackage(tarballPath, destination) {
  mkdirSync(destination, { recursive: true });
  run("tar", ["-xzf", tarballPath, "-C", destination]);
  const packageDir = path.join(destination, "package");
  if (!existsSync(path.join(packageDir, "package.json"))) {
    throw new Error(`Extracted package manifest not found under ${packageDir}`);
  }
  return packageDir;
}

function normalizeWorkspaceVersion(specifier, concreteVersion) {
  if (specifier === "*" || specifier === "workspace:*" || specifier === "workspace:") {
    return concreteVersion;
  }
  if (specifier === "workspace:^") return `^${concreteVersion}`;
  if (specifier === "workspace:~") return `~${concreteVersion}`;
  if (specifier.startsWith("workspace:")) {
    const range = specifier.slice("workspace:".length);
    return range || concreteVersion;
  }
  return specifier;
}

function normalizeManifest(manifest, packageByName) {
  const normalized = structuredClone(manifest);
  const changes = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = normalized[section];
    if (!dependencies || typeof dependencies !== "object") continue;

    for (const [dependencyName, specifier] of Object.entries(dependencies)) {
      if (typeof specifier !== "string") continue;
      const internalPackage = packageByName.get(dependencyName);
      if (!internalPackage) continue;

      const nextSpecifier = normalizeWorkspaceVersion(
        specifier,
        internalPackage.version,
      );
      if (nextSpecifier !== specifier) {
        dependencies[dependencyName] = nextSpecifier;
        changes.push({
          dependencyName,
          from: specifier,
          section,
          to: nextSpecifier,
        });
      }
    }
  }

  return { manifest: normalized, changes };
}

function validatePublishManifest(manifest, packageByName) {
  const errors = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = manifest[section];
    if (!dependencies || typeof dependencies !== "object") continue;

    for (const [dependencyName, specifier] of Object.entries(dependencies)) {
      if (typeof specifier !== "string") continue;
      if (specifier.startsWith("workspace:")) {
        errors.push(
          `${manifest.name}: ${section}.${dependencyName} still uses ${specifier}`,
        );
      }
      if (packageByName.has(dependencyName) && specifier === "*") {
        errors.push(
          `${manifest.name}: ${section}.${dependencyName} still uses wildcard internal version`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

function createRunRoot(args) {
  if (args.stageRoot) {
    mkdirSync(args.stageRoot, { recursive: true });
    return args.stageRoot;
  }
  return mkdtempSync(path.join(tmpdir(), "screeps-framework-publish-"));
}

function safeDirectoryName(packageName) {
  return packageName.replaceAll("/", "__").replaceAll("@", "scope_");
}

function stageAndNormalizePackage(workspacePackage, packageByName, runRoot) {
  const packageRoot = path.resolve(workspacePackage.dir);
  const packageName = workspacePackage.name ?? packageRoot;
  const packageRunRoot = path.join(runRoot, safeDirectoryName(packageName));
  const sourcePackDir = path.join(packageRunRoot, "source-pack");
  const stageExtractDir = path.join(packageRunRoot, "stage");
  const verifyPackDir = path.join(packageRunRoot, "verify-pack");
  const verifyExtractDir = path.join(packageRunRoot, "verify-extract");

  mkdirSync(packageRunRoot, { recursive: true });
  const sourceTarball = packPackage(packageRoot, sourcePackDir);
  const stagedPackageDir = extractPackage(sourceTarball, stageExtractDir);
  const stagedManifestPath = path.join(stagedPackageDir, "package.json");
  const stagedManifest = readJson(stagedManifestPath);
  const { manifest: normalizedManifest, changes } = normalizeManifest(
    stagedManifest,
    packageByName,
  );
  validatePublishManifest(normalizedManifest, packageByName);
  writeJson(stagedManifestPath, normalizedManifest);

  const verifyTarball = packPackage(stagedPackageDir, verifyPackDir);
  const verifiedPackageDir = extractPackage(verifyTarball, verifyExtractDir);
  const verifiedManifest = readJson(path.join(verifiedPackageDir, "package.json"));
  validatePublishManifest(verifiedManifest, packageByName);

  return {
    changes,
    packageDir: stagedPackageDir,
    packageName: normalizedManifest.name,
    sourceTarball,
    stagedManifestPath,
    verifyTarball,
    version: normalizedManifest.version,
  };
}

function runPublishCommand(staged, args) {
  const publishArgs = ["publish", staged.verifyTarball, "--access", args.access];
  if (args.mode === "dry-run") publishArgs.push("--dry-run");
  if (args.mode === "publish" && args.provenance) {
    publishArgs.push("--provenance");
  }
  run("npm", publishArgs, { cwd: repoRoot, stdio: "inherit" });
}

function packageStat(packageDir) {
  try {
    return statSync(packageDir);
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const packageByName = loadWorkspacePackages();
  const selections = args.all
    ? [...packageByName.values()]
        .filter(isFrameworkPublishCandidate)
        .sort((left, right) => left.name.localeCompare(right.name))
    : args.packages.map((selection) => resolvePackage(selection, packageByName));

  const runRoot = createRunRoot(args);
  const summary = [];

  try {
    for (const workspacePackage of selections) {
      if (!workspacePackage?.dir || !packageStat(workspacePackage.dir)?.isDirectory()) {
        throw new Error(`Invalid package directory for ${workspacePackage?.name ?? "unknown"}`);
      }

      if (workspacePackage.private) {
        console.log(`skip ${workspacePackage.name}: package is private`);
        summary.push({ name: workspacePackage.name, skipped: true, reason: "private" });
        continue;
      }

      console.log(`stage ${workspacePackage.name}@${workspacePackage.version}`);
      const staged = stageAndNormalizePackage(workspacePackage, packageByName, runRoot);
      for (const change of staged.changes) {
        console.log(
          `normalize ${staged.packageName}: ${change.section}.${change.dependencyName} ${change.from} -> ${change.to}`,
        );
      }
      if (staged.changes.length === 0) {
        console.log(`normalize ${staged.packageName}: no internal workspace ranges found`);
      }

      if (args.mode === "dry-run" || args.mode === "publish") {
        runPublishCommand(staged, args);
      }

      console.log(`ok ${staged.packageName}@${staged.version}`);
      summary.push({
        changes: staged.changes,
        name: staged.packageName,
        stagedManifestPath: staged.stagedManifestPath,
        version: staged.version,
      });
    }
  } finally {
    if (!args.keepStage && !args.stageRoot) {
      rmSync(runRoot, { force: true, recursive: true });
    }
  }

  if (args.json) {
    console.log(JSON.stringify({ mode: args.mode, packages: summary }, null, 2));
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
