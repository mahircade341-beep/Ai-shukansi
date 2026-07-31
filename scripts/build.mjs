#!/usr/bin/env node
/**
 * Self-healing production build entrypoint.
 *
 * The Freebuff deploy builder invokes the build via `bunx build`, which
 * resolves an executable named "build". This file IS that executable
 * (linked into node_modules/.bin via the package.json "bin" entry), and
 * it guarantees dependencies are present before compiling — so a stale or
 * skipped install cache can never again leave `vite` missing at build time.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 1. Ensure every dependency (including vite) is installed.
const install = spawnSync("bun", ["install"], { cwd: root, stdio: "inherit" });
if (install.status !== 0) {
  process.exit(install.status ?? 1);
}

// 2. Compile the static site with the locally installed vite.
const viteBin = resolve(root, "node_modules/.bin/vite");
const build = spawnSync(viteBin, ["build"], { cwd: root, stdio: "inherit" });
process.exit(build.status ?? 1);
