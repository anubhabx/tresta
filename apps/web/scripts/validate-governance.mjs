import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const projectRoot = path.resolve(import.meta.dirname, "..");

const domainRoots = [
  "lib",
  "hooks",
  "store",
  path.join("components", "testimonials"),
  path.join("components", "account-settings"),
];

const sourceRoots = ["app", "components", "hooks", "lib", "store"];

const restrictedImportSpecifierRegex =
  /(from\s+["'](?:@workspace\/ui\/src\/|\.\.\/\.\.\/packages\/ui\/src\/|\.\.\/packages\/ui\/src\/)[^"']*["'])|(import\(\s*["'](?:@workspace\/ui\/src\/|\.\.\/\.\.\/packages\/ui\/src\/|\.\.\/packages\/ui\/src\/)[^"']*["']\s*\))/;

const codeFileRegex = /\.(ts|tsx|js|mjs)$/;
const explicitAnyRegex = /:\s*any\b|\bas\s+any\b|<\s*any\s*>/;

const walk = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      files.push(...walk(fullPath));
      continue;
    }

    if (codeFileRegex.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

const relative = (absolutePath) =>
  path.relative(projectRoot, absolutePath).replaceAll("\\", "/");

const gatherDomainFiles = () =>
  domainRoots.flatMap((root) => walk(path.join(projectRoot, root)));

const gatherSourceFiles = () =>
  sourceRoots.flatMap((root) => walk(path.join(projectRoot, root)));

const noAnyViolations = [];
for (const filePath of gatherDomainFiles()) {
  const source = fs.readFileSync(filePath, "utf-8");
  if (explicitAnyRegex.test(source)) {
    noAnyViolations.push(relative(filePath));
  }
}

const restrictedImportViolations = [];
for (const filePath of gatherSourceFiles()) {
  const source = fs.readFileSync(filePath, "utf-8");

  if (restrictedImportSpecifierRegex.test(source)) {
    restrictedImportViolations.push(relative(filePath));
  }
}

assert.equal(
  noAnyViolations.length,
  0,
  `Explicit 'any' is disallowed in domain layers. Violations:\n${noAnyViolations.join("\n")}`,
);

assert.equal(
  restrictedImportViolations.length,
  0,
  `Direct imports from package source paths are disallowed. Violations:\n${restrictedImportViolations.join("\n")}`,
);

console.log("Governance validation passed.");
