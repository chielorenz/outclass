import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { Console } from "console";

export function getSystemInfoString(includeCompetitors = true) {
	const cpus = os.cpus();
	const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
	const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB";

	let ocVer = "unknown",
		cvaVer = "unknown",
		tvVer = "unknown";

	try {
		const pkgPath = path.resolve(process.cwd(), "package.json");
		const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
		ocVer = pkg.version;
	} catch (e) {}

	let output = `-------------------------------------------
System: ${os.platform()} ${os.release()} (${os.arch()})
CPU: ${cpuModel} (${cpus.length} cores)
Memory: ${totalMem}
Node: ${process.version}
-------------------------------------------
Outclass: v${ocVer}`;

	if (!includeCompetitors) {
		return output + "\n-------------------------------------------";
	}

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

	return (
		output +
		`\nCVA: v${cvaVer}\nTailwind Variants: v${tvVer}\n-------------------------------------------`
	);
}

export function createLogger(defaultFilenamePrefix: string) {
	const saveIndex = process.argv.indexOf("--save");
	if (saveIndex !== -1) {
		let outFilename = process.argv[saveIndex + 1];
		if (!outFilename || outFilename.startsWith("--")) {
			const date = new Date();
			const dateString = `${String(date.getMonth() + 1).padStart(2, "0")}_${String(date.getDate()).padStart(2, "0")}_${String(date.getFullYear()).slice(-2)}`;
			outFilename = `./benchmarks/${defaultFilenamePrefix}_result_${dateString}.txt`;
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
