import { Bench } from "tinybench";
import { oc } from "../src/index";

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

  const ocStrasfrormers = oc.add("card-wrapper").transform((v: string) => v).transform((v: string) => v);
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

  console.table(bench.table());
}

runOutclassSuite();
