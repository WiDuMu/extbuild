import * as Bun from "bun";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import * as Path from "node:path";
import * as fflate from 'fflate';

const deletePromise = rm("./build", {recursive: true});

const srcDir = "./src";
const staticDir = `${srcDir}/static`;

const getEntrypoints = () => {
    const globber = new Bun.Glob("**/**.{html,js,jsx,ts,tsx}");
    const scan = globber.scanSync({ cwd: srcDir });
    const entrypoints = [...scan].map(path => `./src/${path}`);
    return entrypoints;
}

console.log(getEntrypoints())

await deletePromise;

const artifacts = await Bun.build({
    banner: '"use strict"',
    entrypoints: getEntrypoints(),
    outdir: "./build"
});

const zipped = fflate.zipSync({

});

const manifestFile = Bun.file("./src/manifest.json");
await Bun.write("./build/manifest.json", manifestFile);

const copyPromise = await cp(srcDir, "./build/", { recursive: true });

const buildDir = await readdir("./build", { recursive: true });

await Bun.$`zip -r -9 dist/ext.zip build/`;

console.log(await buildDir);

console.log( await artifacts);

