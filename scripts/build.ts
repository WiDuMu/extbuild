import * as Bun from "bun";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { relative } from "node:path";

const buildDir = "./build";
const distDir = "./dist";
const srcDir = "./src";
const staticDir = `${srcDir}/static`;

async function clearDirs() {
  const build = rm(buildDir, {recursive: true});
  const dist = rm(distDir, {recursive: true});
  return await Promise.all([build, dist]);
}

async function makeDirs() {
  const build = mkdir(buildDir);
  const dist = mkdir(distDir);
  return await Promise.all([build, dist]);
}

function getEntrypoints() {
  const globber = new Bun.Glob("**/**.{html,js,jsx,ts,tsx}");
  const scan = globber.scanSync({ cwd: srcDir });
  const entrypoints = [...scan].map(path => `${srcDir}/${path}`);
  return entrypoints;
}

/** When you don't care about the result of an operation */
function dontCare(promise: Promise<any>): Promise<void> {
  return new Promise((resolve, _) => {
    promise
    .then(() => resolve())
    .catch(() => resolve());
  })
}

await dontCare(clearDirs());
await makeDirs();

const artifacts = Bun.build({
  entrypoints: getEntrypoints(),
  env: "disable",
  format: "esm",
  target: "browser",
  outdir: buildDir
});

const manifestPromise = cp(`${srcDir}/manifest.json`, `${buildDir}/manifest.json`);
const copyPromise = cp(staticDir, `${buildDir}/static/`, { recursive: true });

await Promise.all([manifestPromise, copyPromise, artifacts]);


const relDir = relative(buildDir, distDir);
process.chdir(buildDir);

await Bun.$`zip -r -9 ${relDir}/ext.zip *`;

