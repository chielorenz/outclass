import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { Bench } from "tinybench";
import { cva } from "class-variance-authority";
import { tv } from "tailwind-variants";
import { oc } from "../src/index";

function getBanchTable(bench: Bench) {
  const rawTable = bench.table() as Record<string, any>[];
  const outclassBaselines: Record<string, number> = {};

  for (const row of rawTable) {
    if (!row) continue;
    const taskName = String(row["Task name"] || "");
    const latencyStr = String(row["Latency med (ns)"] || "");
    const latencyNs = parseFloat(latencyStr.split(" ")[0]);

    if (taskName.startsWith("[OC]")) {
      const scenarioName = taskName.replace("[OC]", "").trim().toLowerCase();
      outclassBaselines[scenarioName] = latencyNs;
    }
  }

  return rawTable.map((row) => {
    if (!row) return row;

    const taskName = String(row["Task name"] || "");
    const latencyStr = String(row["Latency med (ns)"] || "");
    const latencyNs = parseFloat(latencyStr.split(" ")[0]);

    const scenarioRaw = taskName.replace(/^\[.*?\]\s*/, "").trim()
      .toLowerCase();
    const ocBaseline = outclassBaselines[scenarioRaw];

    let deltaStr = "/";

    if (!taskName.startsWith("[OC") && ocBaseline && !isNaN(latencyNs)) {
      const percentDiff = ((latencyNs - ocBaseline) / ocBaseline) * 100;

      if (percentDiff > 0) {
        deltaStr = `+${percentDiff.toFixed(1)}%`;
      } else {
        deltaStr = `-${Math.abs(percentDiff).toFixed(1)}%`;
      }
    }

    return {
      ...row,
      "vs Oc": deltaStr,
    };
  });
}

function logSystemInfo() {
  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
  const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB";

  let ocVer = "unknown", cvaVer = "unknown", tvVer = "unknown";

  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    ocVer = pkg.version;
  } catch (e) {}

  try {
    const cvaPath = path.resolve(
      process.cwd(),
      "node_modules/class-variance-authority/package.json",
    );
    cvaVer = JSON.parse(fs.readFileSync(cvaPath, "utf8")).version;
  } catch (e) {}

  try {
    const tvPath = path.resolve(
      process.cwd(),
      "node_modules/tailwind-variants/package.json",
    );
    tvVer = JSON.parse(fs.readFileSync(tvPath, "utf8")).version;
  } catch (e) {}

  console.log(`-------------------------------------------`);
  console.log(`System: ${os.platform()} ${os.release()} (${os.arch()})`);
  console.log(`CPU: ${cpuModel} (${cpus.length} cores)`);
  console.log(`Memory: ${totalMem}`);
  console.log(`Node: ${process.version}`);
  console.log(`-------------------------------------------`);
  console.log(`Outclass: v${ocVer}`);
  console.log(`CVA: v${cvaVer}`);
  console.log(`Tailwind Variants: v${tvVer}`);
  console.log(`-------------------------------------------`);
}

async function runFirsExecution() {
  const bench = new Bench({ time: 500 });

  // String
  const staticString = "base-btn px-4 py-2 font-bold rounded";
  bench.add("[CVA] Static string", () => {
    cva(staticString)();
  });
  bench.add("[TV]  Static string", () => {
    tv({ base: staticString }, { twMerge: false })();
  });
  bench.add("[OC]  Static string", () => {
    oc.add(staticString).resolve();
  });

  // Variants
  bench.add("[CVA] Variants", () => {
    cva("base-btn", {
      variants: {
        intent: { primary: "bg-blue-500", danger: "bg-red-500" },
        size: { sm: "text-sm", lg: "text-lg" },
      },
      defaultVariants: { intent: "primary", size: "sm" },
    })();
  });
  bench.add("[TV]  Variants", () => {
    tv({
      base: "base-btn",
      variants: {
        intent: { primary: "bg-blue-500", danger: "bg-red-500" },
        size: { sm: "text-sm", lg: "text-lg" },
      },
      defaultVariants: { intent: "primary", size: "sm" },
    }, { twMerge: false })();
  });
  bench.add("[OC]  Variants", () => {
    oc.add("base-btn")
      .variant("intent", {
        primary: "bg-blue-500",
        danger: "bg-red-500",
        default: "bg-blue-500",
      })
      .variant("size", { sm: "text-sm", lg: "text-lg", default: "text-sm" })
      .resolve();
  });

  // Compound variants
  bench.add("[CVA] Compound variants", () => {
    cva("base-btn", {
      variants: {
        intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
        status: { active: "opacity-100", disabled: "opacity-50" },
      },
      compoundVariants: [{
        intent: "primary",
        status: "disabled",
        class: "bg-blue-300 grayscale",
      }],
    })({ intent: "primary", status: "disabled" });
  });
  bench.add("[TV]  Compound variants", () => {
    tv({
      base: "base-btn",
      variants: {
        intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
        status: { active: "opacity-100", disabled: "opacity-50" },
      },
      compoundVariants: [{
        intent: "primary",
        status: "disabled",
        class: "bg-blue-300 grayscale",
      }],
    }, { twMerge: false })({ intent: "primary", status: "disabled" });
  });
  bench.add("[OC]  Compound variants", () => {
    oc.add("base-btn")
      .variant("intent", {
        primary: "bg-blue-500",
        outline: "border border-blue-500",
      })
      .variant("status", { active: "opacity-100", disabled: "opacity-50" })
      .variant(
        { intent: "primary", status: "disabled" },
        "bg-blue-300 grayscale",
      )
      .resolve({ intent: "primary", status: "disabled" });
  });

  // Slots
  bench.add("[TV]  Slots", () => {
    const slots = tv({
      slots: {
        base: "card-wrapper border p-4",
        header: "text-lg font-bold border-b pb-2",
        content: "text-sm text-gray-700 py-2",
      },
    }, { twMerge: false })();
    slots.base();
    slots.header();
    slots.content();
  });
  bench.add("[OC]  Slots", () => {
    oc.add("card-wrapper border p-4")
      .slot("header").add("text-lg font-bold border-b pb-2")
      .slot("content")
      .resolve();
  });

  // Slotted variatns
  bench.add("[TV]  Sloted variants", () => {
    const slots = tv({
      slots: {
        base: "card-wrapper border p-4",
        header: "text-lg font-bold border-b pb-2",
        content: "text-sm text-gray-700 py-2",
      },
      variants: {
        color: {
          blue: {
            base: "border-blue-200 bg-blue-50",
            header: "text-blue-900",
            content: "text-blue-800",
          },
          red: {
            base: "border-red-200 bg-red-50",
            header: "text-red-900",
            content: "text-red-800",
          },
        },
      },
    }, { twMerge: false })({ color: "blue" });
    slots.base();
    slots.header();
    slots.content();
  });
  bench.add("[OC]  Sloted variants", () => {
    oc.add("card-wrapper border p-4")
      .variant("color", {
        blue: "border-blue-200 bg-blue-50",
        red: "border-red-200 bg-red-50",
      })
      .slot("header").add("text-lg font-bold border-b pb-2")
      .variant("color", { blue: "text-blue-900", red: "text-red-900" })
      .slot("content")
      .add("text-sm text-gray-700 py-2")
      .variant("color", { blue: "text-blue-800", red: "text-red-800" })
      .resolve({ color: "blue" });
  });

  await bench.run();

  return bench;
}

async function runSubsequentExecution() {
  const bench = new Bench({ time: 100 });

  // String
  const staticString = "base-btn px-4 py-2 font-bold rounded";
  const cvaStatic = cva(staticString);
  const tvStatic = tv({ base: staticString }, { twMerge: false });
  const ocStatic = oc.add(staticString);

  bench.add("[CVA] Static string", () => {
    cvaStatic();
  });
  bench.add("[TV]  Static string", () => {
    tvStatic();
  });
  bench.add("[OC]  Static string", () => {
    ocStatic.resolve();
  });

  // Variants
  const cvaVariants = cva("base-btn", {
    variants: {
      intent: { primary: "bg-blue-500", danger: "bg-red-500" },
      size: { sm: "text-sm", lg: "text-lg" },
    },
    defaultVariants: { intent: "primary", size: "sm" },
  });
  const tvVariants = tv({
    base: "base-btn",
    variants: {
      intent: { primary: "bg-blue-500", danger: "bg-red-500" },
      size: { sm: "text-sm", lg: "text-lg" },
    },
    defaultVariants: { intent: "primary", size: "sm" },
  }, { twMerge: false });
  const ocVariants = oc.add("base-btn")
    .variant("intent", {
      primary: "bg-blue-500",
      danger: "bg-red-500",
      default: "bg-blue-500",
    })
    .variant("size", { sm: "text-sm", lg: "text-lg", default: "text-sm" });

  bench.add("[CVA] Variants", () => {
    cvaVariants();
  });
  bench.add("[TV]  Variants", () => {
    tvVariants();
  });
  bench.add("[OC]  Variants", () => {
    ocVariants.resolve();
  });

  // Compound variants
  const cvaCompound = cva("base-btn", {
    variants: {
      intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
      status: { active: "opacity-100", disabled: "opacity-50" },
    },
    compoundVariants: [{
      intent: "primary",
      status: "disabled",
      class: "bg-blue-300 grayscale",
    }],
  });
  const tvCompound = tv({
    base: "base-btn",
    variants: {
      intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
      status: { active: "opacity-100", disabled: "opacity-50" },
    },
    compoundVariants: [{
      intent: "primary",
      status: "disabled",
      class: "bg-blue-300 grayscale",
    }],
  }, { twMerge: false });
  const ocCompound = oc.add("base-btn")
    .variant("intent", {
      primary: "bg-blue-500",
      outline: "border border-blue-500",
    })
    .variant("status", { active: "opacity-100", disabled: "opacity-50" })
    .variant(
      { intent: "primary", status: "disabled" },
      "bg-blue-300 grayscale",
    );

  bench.add("[TV]  Compound variants", () => {
    tvCompound({ intent: "primary", status: "disabled" });
  });
  bench.add("[CVA] Compound variants", () => {
    cvaCompound({ intent: "primary", status: "disabled" });
  });
  bench.add("[OC]  Compound variants", () => {
    ocCompound.resolve({ intent: "primary", status: "disabled" });
  });

  // Slots
  const tvSlots = tv({
    slots: {
      base: "card-wrapper border p-4",
      header: "text-lg font-bold border-b pb-2",
      content: "text-sm text-gray-700 py-2",
    },
  }, { twMerge: false });
  const ocSlots = oc
    .add("card-wrapper border p-4")
    .slot("header").add("text-lg font-bold border-b pb-2")
    .slot("content").add("text-sm text-gray-700 py-2");

  bench.add("[TV]  Slots", () => {
    const slots = tvSlots({ color: "blue" });
    slots.base();
    slots.header();
    slots.content();
  });
  bench.add("[OC]  Slots", () => {
    ocSlots.resolve();
  });

  // Slotted variatns
  const tvSlotedVars = tv({
    slots: {
      base: "card-wrapper border p-4",
      header: "text-lg font-bold border-b pb-2",
      content: "text-sm text-gray-700 py-2",
    },
    variants: {
      color: {
        blue: {
          base: "border-blue-200 bg-blue-50",
          header: "text-blue-900",
          content: "text-blue-800",
        },
        red: {
          base: "border-red-200 bg-red-50",
          header: "text-red-900",
          content: "text-red-800",
        },
      },
    },
  }, { twMerge: false });
  const ocSlottedVars = oc
    .add("card-wrapper border p-4")
    .variant("color", {
      blue: "border-blue-200 bg-blue-50",
      red: "border-red-200 bg-red-50",
    })
    .slot("header").add("text-lg font-bold border-b pb-2")
    .variant("color", { blue: "text-blue-900", red: "text-red-900" })
    .slot("content").add("text-sm text-gray-700 py-2")
    .variant("color", { blue: "text-blue-800", red: "text-red-800" });

  bench.add("[TV]  Sloted variants", () => {
    const slots = tvSlotedVars({ color: "blue" });
    slots.base();
    slots.header();
    slots.content();
  });
  bench.add("[OC]  Sloted variants", () => {
    ocSlottedVars.resolve({ color: "blue" });
  });

  await bench.run();

  return bench;
}

async function runAll() {
  logSystemInfo();

  console.log("\nFirst execution");
  const benchFirst = await runFirsExecution();
  console.table(getBanchTable(benchFirst));

  console.log("\nSubsequent executions");
  const benchSubEx = await runSubsequentExecution();
  console.table(getBanchTable(benchSubEx));
}

runAll();
