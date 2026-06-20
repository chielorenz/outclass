# Outclass

> Currently in pre-release version, expect breaking changes.

Outclass is a TypeScript CSS class composition library with an immutable, type-safe API.

```ts
import { oc, VariantsOf } from "outclass";

oc.add("flex", "p-2").resolve();
// flex p-2

const sizeVariant = oc.variant("size", { sm: "p-2", lg: "p-6" });
type SizeVariant = VariantsOf<typeof sizeVariant>;
// { size?: "sm" | "lg" | undefined; }
sizeVariant.resolve({ size: "sm" });
// p-2

const titleSlot = oc.slot("title").add("text-lg");
titleSlot.resolve();
// { title: "text-lg" }

const prefixed = oc.transform(v => v.split(" ").map(t => "oc-" + t).join(" "));
prefixed.add("rounded").resolve();
// oc-rounded

oc.add(
  "gap-4",
  prefixed,
  titleSlot.add(sizeVariant),
).resolve({ size: "lg" });
// { base: 'oc-gap-4', title: 'oc-text-lg oc-p-6' }
```

## Installation

Outclass is available on [npm](https://www.npmjs.com/package/outclass) as an ECMAScript module and works on any JavaScript runtime:

```bash
# Node.js
npm add outclass

# Deno
deno add outclass

# Bun
bun add outclass
```

And in the browser:

```html
<script type="module">
  import { oc } from "https://esm.sh/outclass";
</script>
```

The `oc` object can be imported from the `outclass` module:

```ts
import { oc } from "outclass";
```

## Usage

### Adding classes

The `add` method takes any number of strings, splits them by whitespace and adds them to the internal state. The `resolve` method computes the final result and returns it as a string.

```ts
oc.add("flex p-2").resolve();
// flex p-2
 
oc.add("flex", "p-2").resolve();
// flex p-2
```

Outclass objects are immutable, once created, their internal state stays unchanged.

```ts
const unused = oc.add("flex");
oc.add("p-2").resolve();
// p-2
```

Every method call, except `resolve`, returns a new Outclass instance with the updated state.

```ts
oc.add("flex").add("p-2").resolve();
// flex p-2
```

### Variants

Variants are a way to define optional blocks of classes that are added to the final result only if selected at compute time. The `variant` method adds a variant to the internal state; the `resolve` method is used to select variants.

```ts
oc.variant("size", { 
  sm: "p-2",
  lg: "p-6",
}).resolve({ size: "sm" });
// p-2
```

The `default` option is used if no other option is selected.

```ts
oc.variant("style", { 
  default: "font-mono",
  modern: "font-sans",
}).resolve();
// font-mono
```

#### Compound variants

Compound variants are a way to add classes only when specific options of other variants are selected.

```ts
oc.variant("size", {
  sm: "p-2",
  lg: "p-4",
}).variant("style", { 
  default: "font-mono",
  modern: "font-sans",
}).variant(
  { size: "sm", style: "default"},
  "font-bold",
).resolve({ size: "sm" });
// p-2 font-mono font-bold
```

#### Extracting variants types

Variant types can be extracted using the `VariantsOf` utility.

```ts
const sizeVariant = oc.variant("size", { sm: "p-2", lg: "p-6" });
type SizeVariant = VariantsOf<typeof sizeVariant>;
// { size?: "sm" | "lg" | undefined; }
```

### Slots

The `slot` method creates internal branches. Every class added to a slot gets scoped to that slot. When `resolve` finds a slot in the internal state, an object is returned instead of a string.

```ts
oc.slot("header").add("p-2").resolve();
// { header: "p-2" }
```

When at least one slot is defined, classes not attached to any slot end up in the "base" slot.

```ts
oc.add("flex").slot("header").add("p-2").resolve();
// { base: "flex", header: "p-2" }
```

Slot scope doesn't leak. Sibling values in the same `add()` call do not affect each other.

```ts
const header = oc.slot("header").add("gap-4").transform(s => "oc-" + s);
oc.add("flex", header, "p-2").resolve();
// { base: "flex p-2", header: "oc-gap-4" }
```

### Transformers

The `transform` method takes any number of callbacks and calls them right before the final result is returned, passing the computed string as an argument. They are called in the order they are added.

```ts
const prefix = (v: string) => v.split(" ").map(t => "oc-" + t).join(" ");
oc.add("flex p-2").transform(prefix).resolve();
// oc-flex oc-p-2
```

### Composability

The `add` method also accepts any number of Outclass objects, the internal state of given instances is added to the main object.

```ts
const styleVariant = oc.variant("style", { 
  default: "font-mono",
  modern: "font-sans",
});

oc.add("flex", styleVariant).resolve({ style: "modern" });
// flex font-sans
```

Composability is a defining feature of Outclass. You can use it for something as simple as sharing a common transformer, or go all out and build deeply nested, reusable components:

```ts
import { oc as baseOc } from "outclass";

// Prefixing all classes via a transformer on a shared Outclass instance
const prefixer = (v: string) => v.split(" ").map((t) => "tw-" + t).join(" ");
const oc = baseOc.transform(prefixer);

// Define common primitives
const surface = oc.add("border border-slate-200");

// Define common slots
const titleSlot = oc.slot("title");

// Define common variants
const spacingVariant = oc.variant("spacing", {
  compact: "p-4",
  relaxed: "p-8",
});
const toneVariant = oc.variant("tone", {
  default: "text-slate-900",
  muted: "text-slate-500",
});

// Define common transformers
const makeImportant = oc.transform((v: string) => v.split(" ").map((t) => t + "!").join(" "));

// Style the Card component
const card = oc.add(
  "flex flex-col",
  surface,
  titleSlot.add(spacingVariant, makeImportant),
  oc.slot("body").add("text-sm", spacingVariant, toneVariant),
);

// Extending the Card component style
const interactiveCard = card.add(
  "hover:shadow-lg",
  titleSlot.add("hover:text-blue-600"),
);

interactiveCard.resolve({
  spacing: "relaxed",
  tone: "default",
});
// {
//   base: 'tw-flex tw-flex-col tw-border tw-border-slate-200 tw-hover:shadow-lg',
//   title: 'tw-p-8! tw-hover:text-blue-600!',
//   body: 'tw-text-sm tw-p-8 tw-text-slate-900'
// }
```

## Why Outclass?

There are plenty of great tools that accomplish similar things out there, so why build another one? I simply think Outclass's ergonomics are better: the immutable and composable API allows me to define and share styles wherever and however I want, that is basically it.

I took variants from cva, slots from tailwind-variants, and added a fully composable API. If you don't need composability just use one of those.

## TailwindCSS

Outclass is especially useful when used with utility-first CSS frameworks such as TailwindCSS.

### tailwind-merge

To use tailwind-merge, add `twMerge` as a transformer to an Outclass instance and use that instance as the base for all other instances.

```ts
// src/lib/utils.ts
import { oc } from "outclass";
import { twMerge } from "tailwind-merge";

const baseOc = oc.transform(twMerge);

export { baseOc as oc };
```

### IntelliSense

To enable VS Code IntelliSense for TailwindCSS classes while using Outclass, add this regex to your `.vscode/settings.json`:

```jsonc
{
  "tailwindCSS.experimental.classRegex": [
    // Matches oc.add("...") and extracts the strings inside
    ["oc\\.add\\(([^;]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    
    // Matches the values inside oc.variant(..., { ... }) objects
    ["oc\\.variant\\([^,]+,\\s*\\{([^}]*)\\}\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Contributing

Use the included docker compose configuration to spin up the development environment:

```bash
docker compose up
```

This will create a container named `outclass`, install Node.js dependencies, and start the test runner in watch mode, which will watch for changes in the source code and run the tests.

### Debugging

Debugging is available through a TypeScript REPL that exposes the `oc` object. If you are using VS Code, you can start the REPL and attach to the debugger by running the `Debug REPL` configuration from the "Run and Debug" view; execution will pause at breakpoints now.

### Dev Container

The project includes a Dev Container configuration for VS Code. To use it, open the project in VS Code and select "Reopen in Container" from the command palette. Beware that the `.gitconfig` used by the Dev Container may be different from your global config.

## Acknowledgements

Inspiration for this project comes mainly from the amazing job done by [cva](https://github.com/joe-bell/cva), [clsx](https://github.com/lukeed/clsx), and [tailwind-variants](https://github.com/heroui-inc/tailwind-variants).
