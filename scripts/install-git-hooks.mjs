import { execSync } from "node:child_process";
import path from "node:path";

const hooksPath = path.join(".githooks");

try {
  execSync(`git config core.hooksPath ${hooksPath}`, { stdio: "inherit" });
  console.log(`Git hooks path set to ${hooksPath}`);
  console.log("Local pre-push quality gate is now active.");
} catch (error) {
  console.error("Failed to configure git hooks path.");
  process.exit(1);
}
