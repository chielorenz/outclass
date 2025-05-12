import repl from 'node:repl';
import { out } from './src/index';

const replServer = repl.start();
replServer.context.out = out;
replServer.write('out.parse("outclass"); // out object is available\n');


