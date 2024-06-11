# Outclass

Outclass is a CSS class manipulation tool, it allows you to define classes dynamically. For example:

```ts
import { out } from "outclass";

out.parse("flex", "p-2");
// flex p-2

out.set("w-16 h-32").remove("w-16").parse();
// h-32

const patch = out.remove("m-2").add("m-6");
out.set("m-2").apply(patch).parse();
// m-6

out.variant({ sm: "p-2", lg: "p-4" }).choose("sm").parse();
// p-2
```

Outclass is especially useful when used with atomic or utility-first CSS frameworks such as TailwindCSS and UnoCSS.

Read on to learn how to install it or [see it in action](https://stackblitz.com/github/chielorenz/outclass-playground?file=app%2Fpage.tsx) on StackBlitz.

![npm dependencies](https://img.shields.io/badge/dependencies-0-blue?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/outclass?style=flat-square)
![npm license](https://img.shields.io/npm/l/outclass?style=flat-square&color=blue)

## Installation

Outclass is on [npm](https://www.npmjs.com/package/outclass), use your favorite package manager and runtime:

### Node.js

```bash
npm add outclass
```

```bash
yarn add outclass
```

```bash
pnpm add outclass
```

### Deno

```bash
deno add npm:outclass
```

### Bun

```bash
bun add outclass
```

### Browser

```html
<script type="module">
  import { out } from "https://esm.sh/outclass";
</script>
```

## Usage

Outclass is available as a ECMAScript modules (ESM) and exposes the `out` A single object that offers all functionality

```ts
import { out } from "outclass";
```

## Documentation

Intro

### Building

### Variants

---

- Immutability
- Maps
- Accepted inputs
