import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "dist", "client");
const target = path.resolve(projectRoot, "..", "clean_heat_demo", "public");

if (path.basename(target) !== "public" || path.basename(path.dirname(target)) !== "clean_heat_demo") {
  throw new Error(`Refusing unexpected export target: ${target}`);
}

await mkdir(target, { recursive: true });
for (const entry of await readdir(target)) {
  await rm(path.join(target, entry), { recursive: true, force: true });
}
await cp(source, target, { recursive: true });

let sourceCommit = "uncommitted";
try {
  sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8" }).trim();
} catch {
  // The first export can happen before the repository's initial commit.
}
await writeFile(path.join(target, "build-info.json"), `${JSON.stringify({ sourceCommit }, null, 2)}\n`);
console.log(`Exported Firebase client to ${target}`);
