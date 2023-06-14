# Outclass

A tool for creating class strings. A quick example:

```ts
import { out } from "outclass";

// Dynamically create a string of classes
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

The `out.parse()` method takes various inputs and returns a string of classes.

It can take strings, arrays of strings, nested arrays of strings, null, undefined and boolean values and returns a string that contains unique classes: in case of repeated values only the first instance is considered, other values keep the insertion order.

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

// With repeated values
out.parse("flex", "rounded", "flex");
// flex rounded

// It handles nulls and boolean values
out.parse(isActive ? "cursor-pointer" : null, !isDirty && "border-2");
// cursor-pointer border-2
```

### Layers

Using `out.layer` you get a **layer** object. A layer offers methods to build a string of classes interactively, use `layer.add()` to add classes, `layer.remove()` to remove classes and `layer.set()` to override all existing classes with some new ones. This methods accept the same input as `out.parse()`.

Layers follows the builder pattern, this means that each method returns the builder itself so you can chain together multiple method calls.

Once you have finished building your string you can call the `layer.parse()` method to get back the resulting string of classes.

```ts
import { out } from "outclass";

const layer = out.layer.set("flex flex-col rounded");
layer.add("p-2 m-2").remove("rounded").parse();
// flex flex-col p-2 m-2

const classes = [isActive ? "bg-violet-600" : null, "p-2"];
out.layer.set("flex", classes).add("m-2").parse();
// flex bg-violet-600 p-2 m-2
```

Layers are patchable, this means that a layer can be applied to another layer. A layer can be converted to a **patch** by using `layer.patch` getter. The returned patch can be applied to another layer using `layer.apply()`. The patch layer is applied after the main layer.

```ts
import { out } from "outclass";

const patch = out.layer.remove("p-2").add("p-4").patch;
out.layer.set("flex p-2").apply(patch).parse();
// flex p-4
```

Patch are useful to customize a component, an example:

```tsx
import { out, type Patch } from "outclass";

function Button({ patch }: { patch: Patch }) {
  const style = out.layer.set("flex m-2 p-2").apply(patch);

  return <button className={style.parse()} />;
}

export default function Main() {
  const patch = out.layer.add("rounded").remove("p-2").patch;

  return <Button patch={patch} />;
}

// <button class="flex m-2 rounded" />
```

Layers also accept a **configuration object**, which are objects with `set`, `add`, `remove` and `patch` keys and as values the same arguments `out.parse()` does. A configuration object can be used with the `layer.with()` method and with the `layer.parse()` method, with the difference that the first follows the builder pattern and returns itself the second returns the parsed string.

```ts
import { out } from "outclass";

const layer = out.layer.with({
  set: "flex",
  add: ["flex-col p-2", isActive ? "bg-violet-600" : null],
  remove: "p-2",
  patch: out.layer.add("p-4").patch,
});

layer.parse();
// flex flex-col bg-violet-600 p-4
```

<!-- ### Slots -->

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
