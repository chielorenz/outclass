import repl from "node:repl";
import { oc } from "./src/index";

const replServer = repl.start();
replServer.context.oc = oc;
replServer.write('oc.add("outclass").resolve(); // `oc` object is available\n');
