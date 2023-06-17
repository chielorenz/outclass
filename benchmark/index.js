import { out } from "../lib/index.js";
import os from "node:os";
import fs from "node:fs";

const length = 1_000_000;
const input = Array.from({ length }, () => "out");
const start = performance.now();
out.parse(input);
const elapsedTime = performance.now() - start;
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;

const data = {
  timestamp: { now: new Date().toISOString() },
  system: {
    node: process.versions.node,
    v8: process.versions.v8,
    arc: os.arch(),
    platform: os.platform(),
    release: os.release(),
    mem: os.totalmem(),
    cpu: os.cpus()[0].model,
    cores: os.cpus().length,
  },
  package: {
    name: process.env.npm_package_name,
    version: process.env.npm_package_version,
  },
  benchmark: {
    "Parsed tokens": length,
    "Execution time (ms)": elapsedTime,
    "Heap used (MB)": usedMemory,
  },
};

fs.writeFileSync(
  new URL("results.json", import.meta.url),
  JSON.stringify(data, null, 4)
);

for (const [type, values] of Object.entries(data)) {
  console.log(type);
  console.table(values);
}
