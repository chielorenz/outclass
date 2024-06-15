# Outclass

![npm dependencies](https://img.shields.io/badge/dependencies-0-blue?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/outclass?style=flat-square)
![npm license](https://img.shields.io/npm/l/outclass?style=flat-square&color=blue)

> Currently in pre-release version, expect breaking changes.

Outclass is a CSS class manipulation tool. It can be used to create strings of CSS classes dynamically, for example:

```ts
import { out } from "outclass";

// Generates a string of unique class names
out.parse("flex", "rounded", "flex");
// flex rounded

// Implements the builder pattern
out.set("blur w-4").remove("w-4").add("shadow w-2").parse();
// blur shadow w-2

// Has a variants system
out.variant({ sm: "p-2", lg: "p-4" }).choose("sm").parse();
// p-2

// Is patchable
const patch = out.remove("m-2").add("m-4");
out.set("border m-2").apply(patch).parse();
// border m-4

// All in a single call
out.parse({
  add: "m-4",
  apply: patch,
  variant: { sm: "p-2", lg: "p-4" },
  choose: "sm",
});
// m-4 p-2
```

## Installation

Outclass is available on [npm](https:://npm.org/outclass) as ECMAScript module (ESM) and works on any JavaScript
runtime:

```bash
# Node.js
npm add outclass
pnpm add outclass
yarn add outclass

# Deno
deno add npm:outclass

# Bun
bun add outclass
```

And in the browser:

```html
<script type="module">
  import { out } from "https://esm.sh/outclass";
</script>
```

The `out` object can be imported from the `outclass` module:

```ts
import { out } from "outclass";
```

## Documentation

Outclass lets you to create strings of CSS classes. Internally it keeps a list of classes and offers methods to manipulate it. The `parse` method returns a single string consisting of a space-separated list of unique CSS classes, which can be used in the `class` attribute of HTML elements.

There are two main ways of use, which can be combined as desired:

- A [builder](#builder): to programmatically add and remove classes
- A [variant system](#variants): to specify and select style variants

### Inputs

Most methods takes as arguments multiple strings and arrays of strings (infinitely nested):

```ts
out.parse("flex", ["grow"], [["p-2"]]);
// flex grow p-2
```

Each input string is splitted into single classes on white-spaces:

```ts
out.add("flex grow").remove("grow").remove("flex").parse();
// ""
```

It only understand string inputs, but for convenience it also takes, `null`, `undefined` and `boolean` values, so it
can be used with the `&&` operator and `?.` optional chaining:

```ts
const isMuted = false;
const props = { classes: "bg-slate-700" };
out.parse([
  isMuted && "cursor-not-allowed",
  props?.classes,
  [null, undefined, false, true],
]);
// bg-slate-700 flex grow
```

### Immutability

The `out` object is immutable, each call to its methods returns a new instance:

```ts
const style = out.add("text-end");

out.parse();
// ""

style.parse();
// text-end
```

This makes it more convenient as you can use it directly in method chaining without the need to create new instances
of it every time:

```ts
out.set("box-content p-4").apply(out.remove("p-4")).parse();
// box-content
```

### Using the builder<a id="builder"></a>

The `out` object implements the builder pattern, the `add` and `remove` methods add and remove classes respectively,
the `set` method replaces the current list of classes with a new one:

```ts
out.add("flex").parse();
// flex

out.add("grow p-2").remove("grow").parse();
// p-2

out.add("flex").set("p-2").parse();
// p-2
```

### Using variants<a id="variants"></a>

The `variant` method is used to specify variants of style, for example a _size_ variant can have options _small_ and
_large_ and a _color_ variant can have options _violet_ and _blue_. The `choose` method selects which variants to use.
Only one option per variant can be selected at a time:

```ts
out
  .variant({ small: "p-2", large: "p-4" })
  .variant({ violet: "bg-violet-500", blue: "bg-blue-500" })
  .choose("small blue")
  .parse();
// p-2 bg-violet-500
```

Variants can have _compound_ options, which are option with multiple names separated by spaces. Compound options are selected when all names are passed to the `choose` method:

```ts
out
  .variant({ small: "p-2", large: "p-4" })
  .variant({ violet: "bg-violet-500", blue: "bg-blue-500" })
  .variant({ "small violet": "rounded" })
  .choose("small violet")
  .parse();
// p-2 bg-violet-500 rounded
```

The `choose` method can be called multiple times to change the selected variants, this means that it can be used to specify the default variant and then change it later:

```ts
out
  .variant({ small: "p-2", large: "p-4" })
  .choose("small")
  .choose("large", "small")
  .parse();
// p-2
```

### Patching

The `apply` method is used to apply patches to the list of classes. Patches are evaluated last, after manipulation of the main object are, and the order they are applied is kept. A patch simply is a `out` object:

```ts
const patch = out.remove("m-2").add("m-4");
out.set("border m-2").apply(patch).parse();
// border m-4

const pick = out.choose("small");
out.variant({ small: "p-2", large: "p-4" }).choose("large").apply(pick).parse();
// p-2
```

### All in a single call

All functionality can be combined in a single call to the `with` method, which takes an object where each key is a method name and the value is the arguments to pass to that method:

```ts
// All in a single call
out
  .with({
    set: "grid grow"
    remove: "grid",
    add: "flex",
    apply: out.choose("small"),
    variant: { sm: "p-2", lg: "p-4" },
    choose: "large",
  })
  .parse();
// grow flex p-4
```

### The `parse` method

The `parse` can be called with no arguments to get the current list of classes, but it can also be called with a
string, in which case it acts as the `add` method, or with an object, in which case it acts as the `with` method:

```ts
out.set("flex").parse("grow");
// flex grow

out.set("flex").parse({
  add: "m-4",
  variant: { sm: "p-2", lg: "p-4" },
  choose: "sm",
});
// flex m-4 p-2
```

## TailwindCSS

Outclass is especially useful when used with atomic or utility-first CSS frameworks such as TailwindCSS. To enable VS Code IntelliSense for TailwindCSS classes, add this regex to your `.vscode/settings.json`:

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

### Acknowledgements

Inspiration for this project comes mainly from the amazing job done by [cva](https://github.com/joe-bell/cva) and [clsx](https://github.com/lukeed/clsx).
