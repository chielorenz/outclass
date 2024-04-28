# Outclass

> Currently in pre-release version, expect breaking changes.

Outclass is a CSS class string manipulation tool, it allows you to define classes in a dynamic and composable way. For example:

```ts
import { out } from "outclass";

out.parse("flex rounded", "p-2");
// flex rounded p-2

out.parse([
    "w-32 h-32"
    isActive ? "cursor-pointer" : "cursor-not-allowed",
    isDirty && "border-2",
]);
// w-32 h-32 cursor-pointer, when isActive is true and isDirty is false

const customStyle = out.remove("p-2").add("p-4");
out.apply(customStyle).parse("flex p-2");
// flex p-4
```

Outclass is especially useful when used with atomic or utility-first CSS frameworks such as TailwindCSS and UnoCSS, read the [documentation](#documentation) or try the [playground on CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/outclass-playground?file=app%2Fpage.tsx).

## Main features

- Zero dependencies
- Framework agnostic
- Fully typed
- Fully tested
- Tiny: ~ 1KB minified + brotli

## Installation

### Node

```bash
npm  add outclass
yarn add outclass
pnpm add outclass
```

### Bun

```bash
bun add outclass
```

### Deno

```ts
import { out } from "https://esm.sh/outclass";
```

### In the browser

```html
<script type="module">
  import { out } from "https://esm.sh/outclass";
  out.parse("flex");
</script>
```

## Documentation

All methods are exposed by the `out` object, which can be imported from the `outclass` module:

```ts
// Local esm module
import { out } from "outclass";

// Remote esm module
import { out } from "https://esm.sh/outclass";

// CommonJs
const { out } = require("outclass");
```

### Parsing

Generally speaking the core functionality is converting some input into a single string consisting of a space-separated list of unique CSS classes, where the order of the input is preserved and, in case of duplicate values, only the first instance is kept.

For this purpose there is the `parse` method. It takes strings and arrays of strings as input, also handling nested values:

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

It also takes null, undefined and boolean values, empty strings and empty arrays, so it can be used with the `&&` operator and `?.` optional chaining:

```ts
out.parse("", null, undefined, true, false, []);
// ""

const props = { classes: "bg-slate-700" };
out.parse(isMuted && "cursor-not-allowed", props?.classes);
// cursor-not-allowed bg-slate-700, when isMuted is true
```

### Building

The `out` object is also a builder, which meas it offers some **"actions"** methods to dynamically build string of classes: `add`, `remove` and `set`, respectively to add, remove and overwrite classes.

```ts
out.add("flex p-2").remove("p-2").parse();
// flex

out.add("h-12 bg-violet-400").set("rounded").parse();
// rounded
```

Actions accepts the same arguments as the `parse` method does:

```ts
out.add(["clear-right", ["columns-2"]]).parse();
// clear-right columns-2
```

Combining actions methods with the `parse` method results in the parse method to act as the `add` method:

```ts
out.add("place-self-start").parse("m-4");
// place-self-start m-4
```

#### Immutability

Actions methods always return a new instance of `out`, making it **immutable**:

```ts
const style = out.add("text-end");

out.parse();
// ""

style.parse();
// text-end
```

This, as already shown in the examples, allows for method chaining:

```ts
out.set("box-content p-4").add("inline").apply(out.remove("p-4")).parse();
// box-content inline
```

### Compose

Object of type `out` can be composed together using the `apply` method.

```ts
const style = out.add("tracking-wide");
out.apply(style).parse();
// tracking-wide
```

Applied classes are queued up and evaluated after the classes of the main object:

```ts
out.apply(out.remove("m-2")).add("self-end m-2").parse();
// self-end
```

Composability is not limited to one level of depth:

```ts
out.apply(out.apply(out.add("flex"))).parse();
// flex
```

### Actions map

To apply multiple actions in a single method call you can use the `with` method. It takes an "actions map" which is an object that contains multiple actions:

```ts
out
  .with({
    set: "space-x-4",
    add: "flex-wrap overflow-clip",
    remove: "flex-wrap",
    apply: out.add("order-4"),
  })
  .parse();
// space-x-4 overflow-clip order-4
```

Actions map can also be used as parameters of the `parse` method:

```ts
out.parse({ add: "grow", apply: out.add("order-8")}):
// grow order-8
```

## Integrations

### VS Code TailwindCSS IntelliSense

To enable TailwindCSS IntelliSense on Outclass methods calls, add this regex to your `.vscode/settings.json`:

<details>
<summary>Open snippet</summary>

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

</details>

# TODO

- [] ~~Should add(), remove() and set() take an Outclass? If so, we could deprecate apply().~~ NO, apply() is there for a difference reason, to apply a patch of which you don't know the content! I does not make sense to add(patch) but the patch really is removing classes.
- [] Should with() take an array of Maps?
- [] Should apply() take an array of Outclass?
- [] Should choose() accepts (...items: Items[]) like other methods?
