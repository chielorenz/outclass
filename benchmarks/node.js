import { out } from "../lib/index.js";
import os from "node:os";

const length = 1_000_000;
const input = Array.from({ length }, () => "out");
const start = performance.now();
out.parse(input);
const elapsedTime = performance.now() - start;
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;

console.table({
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
});

console.table({
  package: {
    name: process.env.npm_package_name,
    version: process.env.npm_package_version,
  },
});

console.table({
  "out.parse()": {
    "Parsed tokens": length,
    "Execution time (ms)": elapsedTime,
    "Heap used (MB)": usedMemory,
  },
});
