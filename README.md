# Outclass

A tool for creating class strings. A quick example:

```ts
import { out } from "outclass";

// Dinamically create a string of classes
out.parse("flex flex-col", isRound ? "rounded" : null);
// output: "flex flex-col rounded"

// Using "patchable layers"
const patch = out.layer.add("p-2").remove("flex").patch;
out.layer.add("flex m-4").apply(patch).parse();
// output: "m-4 p-2"

// Using "write-once slots"
const slots = out.slots.set("spacing", "p-2");
slots.set("spacing", "m-4").set("sizing", "w-8").parse();
// output: "p-2 w-8"
```

At its core is a set of utilities for dynamically creating, updating and extending class strings. It is especially useful when used with atomic or utility-first CSS frameworks like TailwindCSS and UnoCSS.

You can try an interactive demo on [CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/stype-demo?file=app%2Fpage.tsx).

## Features

- Fully typed
- Framework agnostic
- Zero dependencies
- Lightweight: < 1kB (min + brotli)
- Fast: see the [benchmark](/benchmark) folder

## Intallation

### Node

```bash
npm  add github:b1n01/outclass
yarn add github:b1n01/outclass
pnpm add github:b1n01/outclass
```

### Deno

```ts
import { out } from "https://esm.sh/gh/b1n01/outclass";
```

### Bun

```bash
bun add github:b1n01/outclass
```

## Documentation

### Parser

### Layers

### Slots

## Integrations

### VS Code TailwindCSS IntelliSense

To enable TailwindCSS IntelliSense on Outclass functions calls, add this regex to your `.vscode/settings.json`:

```jsonc
{
  "tailwindCSS.experimental.classRegex": [
    // Enable IntelliSense on Outclass function calls outside "className" attribute
    [
      "\\.(?:parse|add|remove|set|with)\\s*\\(\\s*([\\s\\S]*?)\\s*\\)\\s*",
      "[\"'`]([^\"'`]*)[\"'`]"
    ]
  ]
}
```
