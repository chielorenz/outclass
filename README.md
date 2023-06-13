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

At its core is a set of utilities for dynamically building, updating and extending class strings. It is especially useful when used with atomic or utility-first CSS frameworks like TailwindCSS and UnoCSS.

You can try an interactive demo on [CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/stype-demo?file=app%2Fpage.tsx).

## Features

- Fully typed
- Framework agnostic
- Zero dependencies
  <!-- - Lightweight: < 1kB (min + brotli) -->
  <!-- - Fast: see the [benchmark](/benchmark) folder -->

## Intallation

### Node

```bash
npm add github:b1n01/outclass
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

### Parsing

The `parse` method takes various inputs and returns a string of classes.

It can takes strings, arrays of strings, nested arrays of strings, null, undefined and boolean values and returns string that contains unique classes: in case of repeated values only the first instance is considered, other values keep the insertion order.

```ts
import { out } from "outclass";

// From a space-separated list of classes
out.parse("flex flex-col");
// flex flex-col

// From multiple parameters
out.parse("p-2 m-2", "rounded");
// p-2 m-2 rounded

// From arrays
out.parse("flex rounded", ["p-2", "m-2"]);
// flex rounded p-2 m-2

// From nested arrays
out.parse(["flex", ["p-2", "m-2"]]);
// flex p-2 m-2

// With repeted values
out.parse("flex", "rounded", "flex");
// flex rounded

// It handles nulls and boolean values
out.parse(isActive ? "cursor-pointer" : null, !isDirty && "border-2");
// cursor-pointer border-2
```

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
