# Outclass

Outclass is a class string manipulation tool. It offers a set of utility for creating, editing and extending class strings. It is especially useful when used with atomic or utility-first CSS frameworks such as TailwindCSS and UnoCSS. A quick example:

```ts
import { out } from "outclass";

// Dynamically create a class string
out.parse("flex flex-col", isRound && "rounded");
// output: "flex flex-col rounded", if isRound is true

// Using "patchable layers"
const layer = out.layer.add("p-2").remove("flex");
out.layer.add("flex m-4").apply(layer.patch).parse();
// output: "m-4 p-2"

// Using "write-once slots"
const slots = out.slots.set("spacing", "p-2");
slots.set("spacing", "m-4").set("sizing", "w-8").parse();
// output: "p-2 w-8"
```

You can go on and read the [documentation](#documentation) or try the interactive demo on [CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/stype-demo?file=app%2Fpage.tsx).

## Features

- 🔤 Fully typed
- 🏳️‍🌈 Framework agnostic
- ✊ Zero dependencies
- 🪶 Lightweight: less than 1KB (minified + gzipped)
  <!-- - ⚙️ Fully tested -->
  <!-- - ⚡ Fast: see the [benchmark](/benchmark) folder -->

## Installation

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

Outclass is composed by three main components:

- A **parser**, that takes string inputs and returns the computed classes as string
- A patchable **layer** system that can build and patch "layers" of classes
- Write-once **slots**, a mechanism to write immutable classes

All components are exposed by the _out_ object that can be imported from _outclass_:

```ts
import { out } from "outclass";

// Use the parser
out.parse();

// Get a layer
const layer = out.layer;

// Get write-once slots
const slots = out.slots;
```

### Parser

The parser is a single function that takes any number of strings, arrays of strings, null or boolean values and returns a string containing a unique list of classes, sorted by their insertion orders. In case duplicate values are given as input, only the first occurrence is kept.

The parser function is exposed via `out.parse()`.

```ts
import { out } from "outclass";

// Always returns a string
out.parse();
// ""

// Takes any number of strings
out.parse("flex", "p-2 m-2", "rounded");
// flex p-2 m-2 rounded

// Arrays and nested arrays
out.parse(["flex-col", ["w-24", "pt-6"]]);
// flex-col w-24 pt-6

// First occurrence is kept
out.parse("flex", "rounded", "flex");
// flex rounded

// Null, undefined and boolean values are handled
out.parse([
  isRound ? "rounded" : undefined,
  isActive ? "cursor-pointer" : null,
  isDirty && "p-2 m-2",
]);
// rounded cursor-pointer p-2 m-2, if isRound, isActive and isDirty are true
```

### Layer

A layer is an object that offers methods to build string of classes interactively.

Use `layer.add()` and `layer.remove()` to and remove classes, use `layer.set()` to override all existing classes with some new ones. This three methods are often referred as layer "actions". All layer methods take the same input that `out.parse()` takes.

Layers implement the builder pattern, this means that each method returns the layer itself so you can chain together multiple method calls.

Once you have finished building your string you can call the `layer.parse()` method to get back the resulting string of classes.

A layer can be obtained via the `out.layer` getter method.

```ts
import { out } from "outclass";

out.layer.add("flex").add("rounded").parse();
// flex rounded

out.layer.set("flex-col").set("p-4").parse();
// p-2

out.layer.add("h-8").remove("h-8 w-24").parse();
// ""

out
  .set("flex flex-col")
  .add("rounded border-4 p-8 m-8")
  .remove("flex-col p-8")
  .parse();
// flex rounded border-4 m-8
```

Layers are "patchable", this means that a layer can be applied to another layer. To create a **patch** from a layer use the `layer.patch` getter method. A patch can be applied to another layer using `layer.apply()` method. **The patched layer is applied after the main layer**.

```ts
import { out } from "outclass";

// Create a patch from a layer
const patch = out.layer.add("p-4").remove("p-2").patch;

// Apply the patch to another layer
const layer = out.layer.set("flex p-2").apply(patch);

layer.parse();
// flex p-4
```

Patches are useful for extending and customizing classes used in a different context. A component can take a patch as an argument and use it to style itself, allowing the parent component to style the child component directly.

```tsx
import { out, type Patch } from "outclass";

function Button({ patch }: { patch: Patch }) {
  const style = out.layer.set("flex m-2 p-2").apply(patch);

  return <button className={style.parse()} />;
}

export default function Main() {
  const buttonStyle = out.layer.add("rounded").remove("p-2");

  return <Button style={buttonStyle.patch} />;
}

// <button class="flex m-2 rounded" />
```

Layers also accept **configuration objects**. A configuration object is an object whose keys are _set_, _add_, _remove_ and _patch_.

The three "actions keys" _set_, _add_ and _remove_ take as values that `out.parse()` takes. The _patch_ key takes a patch.

A configuration object can be used via `layer.with()` and `layer.parse()` methods, with the difference that the first follows the builder pattern and returns itself the second returns the parsed string.

```ts
import { out } from "outclass";

out.layer.with({ set: "flex", patch: out.layer.add("p-4").patch }).parse();
// flex p-4

const layer = out.layer.parse({
  set: "flex",
  add: ["rounded m-2", isActive ?? "border-2"],
  remove: "m-2",
  patch: out.layer.add("p-4").patch,
});

// flex rounded border-2 p-4
```

### Slots

The slots system is a "write-once" storage, or in other words a immutable key-value pair.

A slot can be set with the `slots.set()` method, that takes the key and the value of the slot. Once a slot with a certain key is written, all followings writing of the same key are ignored.

The `slots.parse()` method returns the computed string of classes. You can get slots using `out.slots` getter method.

```ts
import { out } from "outclass";

const slots = out.slots.set("spacing", "p-4", "m-2");
slots.set("spacing", "p8 m-8").parse();
// p-4 m-4
```

Slots are useful when you want to offer a customizable interface, by exposing only to a certain sets of values, called precisely "slots".

A child component can expose a _spacing_ and a _sizing_ slot, which can be customized by a parent component by passing a pre-populated slot as argument. The child can use other classes other than those exposed by spacing ang sizing slots but decides to keep them private.

This is the difference with the Layers which allow a parent component to customize all the classes.

```tsx
import { out, type Slots } from "outclass";

function Button({ slots }: { slots: Slots }) {
  slots.set("spacing", "m-2 p-2").set("sizing", "w-32 h-32");

  return <button className={slots.parse()} />;
}

export default function Main() {
  const buttonStyle = out.slots.set("spacing", "m-4 p-4");

  return <Button style={buttonStyle} />;
}

// <button class="m-4 p-4 w-32 h-32" />
```

<!-- ### Combining layers and slots -->

## Integrations

### VS Code TailwindCSS IntelliSense

To enable TailwindCSS IntelliSense on Outclass methods calls, add this regex to your `.vscode/settings.json`:

```jsonc
{
  "tailwindCSS.experimental.classRegex": [
    // Enable IntelliSense on Outclass method calls outside "className" and "class" attributes
    [
      "\\.(?:parse|add|remove|set|with)\\s*\\(\\s*([\\s\\S]*?)\\s*\\)\\s*",
      "[\"'`]([^\"'`]*)[\"'`]"
    ]
  ]
}
```
