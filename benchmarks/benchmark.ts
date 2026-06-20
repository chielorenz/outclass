import { cva } from "class-variance-authority";
import { tv } from "tailwind-variants";
import { Bench } from "tinybench";
import { oc } from "../src/index";
import { Console } from "node:console";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export function getSystemInfoString() {
	const cpus = os.cpus();
	const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
	const totalMem = `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`;

	let ocVer = "unknown",
		cvaVer = "unknown",
		tvVer = "unknown";

	try {
		const pkgPath = path.resolve(process.cwd(), "package.json");
		const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
		ocVer = pkg.version;
	} catch (_e) {}

	const output = `-------------------------------------------
System: ${os.platform()} ${os.release()} (${os.arch()})
CPU: ${cpuModel} (${cpus.length} cores)
Memory: ${totalMem}
Node: ${process.version}
-------------------------------------------
Outclass: v${ocVer}`;

	try {
		const cvaPath = path.resolve(
			process.cwd(),
			"node_modules/class-variance-authority/package.json",
		);
		cvaVer = JSON.parse(fs.readFileSync(cvaPath, "utf8")).version;
	} catch (_e) {}

	try {
		const tvPath = path.resolve(
			process.cwd(),
			"node_modules/tailwind-variants/package.json",
		);
		tvVer = JSON.parse(fs.readFileSync(tvPath, "utf8")).version;
	} catch (_e) {}

	return (
		output +
		`\nCVA: v${cvaVer}\nTailwind Variants: v${tvVer}\n-------------------------------------------`
	);
}

export function createLogger() {
	const saveIndex = process.argv.indexOf("--save");
	if (saveIndex !== -1) {
		let outFilename = process.argv[saveIndex + 1];
		if (!outFilename || outFilename.startsWith("--")) {
			const date = new Date();
			const dateString = `${String(date.getMonth() + 1).padStart(2, "0")}_${String(date.getDate()).padStart(2, "0")}_${String(date.getFullYear()).slice(-2)}`;
			outFilename = `./benchmarks/result_${dateString}.txt`;
		}
		const writeStream = fs.createWriteStream(
			path.resolve(process.cwd(), outFilename),
		);
		const fileLogger = new Console(writeStream, writeStream);

		return {
			log: (...args: any[]) => {
				console.log(...args);
				fileLogger.log(...args);
			},
			table: (data: any) => {
				console.table(data);
				fileLogger.table(data);
			},
			done: () => {
				console.log(`\nSaved benchmark results to ${outFilename}`);
				writeStream.close();
			},
		};
	}

	return {
		log: (...args: any[]) => console.log(...args),
		table: (data: any) => console.table(data),
		done: () => {},
	};
}

function getBenchTable(bench: Bench) {
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

		const scenarioRaw = taskName
			.replace(/^\[.*?\]\s*/, "")
			.trim()
			.toLowerCase();
		const ocBaseline = outclassBaselines[scenarioRaw];

		let deltaStr = "/";

		if (!taskName.startsWith("[OC") && ocBaseline && !Number.isNaN(latencyNs)) {
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

async function runOutclassSuite() {
	const bench = new Bench({ time: 100, warmupTime: 50 });

	bench.add("Initialization", () => {
		oc.add("base-style", oc.add("flex"))
			.variant("intent", { primary: "bg-blue-500", secondary: "bg-gray-500" })
			.slot("icon")
			.transform((v: string) => v);
	});

	const ocString = oc.add("text-sm font-medium text-gray-900 m-1 p-2");
	bench.add("Resolve static string", () => {
		ocString.resolve();
	});

	const ocVariants = oc
		.variant("intent", {
			primary: "bg-blue-500 text-white",
			secondary: "bg-zinc-200",
		})
		.variant("size", {
			sm: "text-xs p-1",
			md: "text-sm p-2",
			lg: "text-lg p-4",
		})
		.variant({ intent: "primary", size: "lg" }, "shadow-xl ring-2");
	bench.add("Resolve variants", () => {
		ocVariants.resolve({ intent: "primary", size: "lg" });
	});

	const ocSlots = oc
		.add("card-wrapper")
		.slot("header")
		.add("border-b pb-2")
		.slot("content")
		.add("p-4 text-base");
	bench.add("Resolve slots", () => {
		ocSlots.resolve();
	});

	const ocStrasfrormers = oc
		.add("card-wrapper")
		.transform((v: string) => v)
		.transform((v: string) => v);
	bench.add("Resolve transformers", () => {
		ocStrasfrormers.resolve();
	});

	let deepOc = oc.add("root");
	for (let i = 0; i < 30; i++) {
		deepOc = deepOc.add(`layer-${i}`);
	}
	bench.add("Resolve 30 layer tree", () => {
		deepOc.resolve();
	});

	const ocList = oc
		.add("list-item flex items-center p-2 border-b")
		.variant("status", { active: "bg-green-50", inactive: "bg-gray-50" })
		.variant("role", {
			admin: "font-bold text-blue-900",
			user: "text-gray-700",
		});
	bench.add("Simulation 10,000 item list", () => {
		for (let i = 0; i < 10_000; i++) {
			ocList.resolve({
				status: i % 2 === 0 ? "active" : "inactive",
				role: i % 10 === 0 ? "admin" : "user",
			});
		}
	});

	await bench.run();

	return bench;
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
		tv(
			{
				base: "base-btn",
				variants: {
					intent: { primary: "bg-blue-500", danger: "bg-red-500" },
					size: { sm: "text-sm", lg: "text-lg" },
				},
				defaultVariants: { intent: "primary", size: "sm" },
			},
			{ twMerge: false },
		)();
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
			compoundVariants: [
				{
					intent: "primary",
					status: "disabled",
					class: "bg-blue-300 grayscale",
				},
			],
		})({ intent: "primary", status: "disabled" });
	});
	bench.add("[TV]  Compound variants", () => {
		tv(
			{
				base: "base-btn",
				variants: {
					intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
					status: { active: "opacity-100", disabled: "opacity-50" },
				},
				compoundVariants: [
					{
						intent: "primary",
						status: "disabled",
						class: "bg-blue-300 grayscale",
					},
				],
			},
			{ twMerge: false },
		)({ intent: "primary", status: "disabled" });
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
		const slots = tv(
			{
				slots: {
					base: "card-wrapper border p-4",
					header: "text-lg font-bold border-b pb-2",
					content: "text-sm text-gray-700 py-2",
				},
			},
			{ twMerge: false },
		)();
		slots.base();
		slots.header();
		slots.content();
	});
	bench.add("[OC]  Slots", () => {
		oc.add("card-wrapper border p-4")
			.slot("header")
			.add("text-lg font-bold border-b pb-2")
			.slot("content")
			.resolve();
	});

	// Slotted variatns
	bench.add("[TV]  Sloted variants", () => {
		const slots = tv(
			{
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
			},
			{ twMerge: false },
		)({ color: "blue" });
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
			.slot("header")
			.add("text-lg font-bold border-b pb-2")
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
	const tvVariants = tv(
		{
			base: "base-btn",
			variants: {
				intent: { primary: "bg-blue-500", danger: "bg-red-500" },
				size: { sm: "text-sm", lg: "text-lg" },
			},
			defaultVariants: { intent: "primary", size: "sm" },
		},
		{ twMerge: false },
	);
	const ocVariants = oc
		.add("base-btn")
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
		compoundVariants: [
			{
				intent: "primary",
				status: "disabled",
				class: "bg-blue-300 grayscale",
			},
		],
	});
	const tvCompound = tv(
		{
			base: "base-btn",
			variants: {
				intent: { primary: "bg-blue-500", outline: "border border-blue-500" },
				status: { active: "opacity-100", disabled: "opacity-50" },
			},
			compoundVariants: [
				{
					intent: "primary",
					status: "disabled",
					class: "bg-blue-300 grayscale",
				},
			],
		},
		{ twMerge: false },
	);
	const ocCompound = oc
		.add("base-btn")
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
	const tvSlots = tv(
		{
			slots: {
				base: "card-wrapper border p-4",
				header: "text-lg font-bold border-b pb-2",
				content: "text-sm text-gray-700 py-2",
			},
		},
		{ twMerge: false },
	);
	const ocSlots = oc
		.add("card-wrapper border p-4")
		.slot("header")
		.add("text-lg font-bold border-b pb-2")
		.slot("content")
		.add("text-sm text-gray-700 py-2");

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
	const tvSlotedVars = tv(
		{
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
		},
		{ twMerge: false },
	);
	const ocSlottedVars = oc
		.add("card-wrapper border p-4")
		.variant("color", {
			blue: "border-blue-200 bg-blue-50",
			red: "border-red-200 bg-red-50",
		})
		.slot("header")
		.add("text-lg font-bold border-b pb-2")
		.variant("color", { blue: "text-blue-900", red: "text-red-900" })
		.slot("content")
		.add("text-sm text-gray-700 py-2")
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
	const logger = createLogger();
	logger.log(getSystemInfoString());

	logger.log("\nOutclass");
	const outclass = await runOutclassSuite();
	logger.table(getBenchTable(outclass));

	logger.log("\nCompetitors | First execution");
	const benchFirst = await runFirsExecution();
	logger.table(getBenchTable(benchFirst));

	logger.log("\nCompetitors | Subsequent executions");
	const benchSubEx = await runSubsequentExecution();
	logger.table(getBenchTable(benchSubEx));

	logger.done();
}

runAll();
