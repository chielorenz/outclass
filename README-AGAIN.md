# Outclass

Outclass is a CSS class string manipulation tool, it allows you to define classes in a dynamic and composable way.

```ts
import { out } from "outclass"

out.parse("flex rounded", "p-2");
// flex rounded p-2

out.parse([
    "w-32 h-32"
    isActive ? "cursor-pointer" : "cursor-not-allowed",
    isDirty && "border-2",
]);
// w-32 h-32 cursor-pointer, when isActive = true and isDirty = false

const customStyle = out.remove("p-2").add("p-4");
out.apply(customStyle).parse("flex p-2");
// flex p-4
```

Read the [documentation](#documentation) or try the [playground on CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/stype-demo?file=app%2Fpage.tsx).

## Some distinctive features:

- Zero dependencies
- Framework agnostic
- Fully typed
- Tiny: ~ 1KB minified + brotli
- Fast: parses 1M tokens ~ 100ms
- Fully tested

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

All methods are exposed by the `out` object, which can be imported from the `outclass` module:

```ts
import { out } from "outclass";
```

In general the main functionality is converting the input into a single string consisting of a space-separated list of unique CSS classes, where the order of the input is preserved and, in case of duplicate values, only the first instance is kept.

To do this there is the `parse` method. It takes strings, array of strings and handles nesting:

```ts
out.parse("flex p-2");
// flex p-2

out.parse("rounded", "m-4");
// rounded m-4

out.parse(["border-2", "h-8"]);
// border-2 h-8

out.parse(["drop-shadow"], ["opacity-50"]);
// drop-shadow opacity-50

out.parse([["bg-cover"]]);
// bg-cover
```

It handles null, undefined and boolean values, empty strings and empty arrays, so it can be used with the `&&` operator and `?.` optional chaining:

```ts
out.parse("", null, undefined, true, false, []);
// ""

const props = { classes: "bg-slate-700" };
out.parse([isMuted && "cursor-not-allowed", props?.classes]);
// cursor-not-allowed bg-slate-700, if isMuted is true
```
