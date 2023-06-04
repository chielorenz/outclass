# Stype

Tool for the dynamic creation of CSS classes.

Stype is a dev-friendly TypeScript tool that takes various types of input and returns a string containing CSS classes. It is especially useful when used with atomic css frameworks like [TailwindCSS](https://tailwindcss.com/docs/installation) and [UnoCSS](https://unocss.dev/)

Try out the interactive demo on [CodeSandbox](https://codesandbox.io/p/sandbox/github/b1n01/stype-demo?file=app%2Fpage.tsx).

## Intallation

### Node

```bash
npm install github:b1n01/stype
yarn add github:b1n01/stype
pnpm add github:b1n01/stype
```

### Deno

```ts   
import { s } from "https://esm.sh/gh/b1n01/stype";
```

### Bun

```bash
bun add github:b1n01/stype
```

## Usage

Creating classes from various input:

```ts
import { s } from "stype";

s.parse("flex flex-col");
// flex flex-col

s.parse(["mx-auto my-2", "px-2"]);
// mx-auto my-2 px-2

s.parse({ size: "text-lg", weight: "font-bold" });
// text-lg font-bold
```

Using `s.from()` gives you a 'builder':

```ts
import { s } from "stype";

s.from("flex flex-col").parse();
// flex flex-col

s.from().add("mx-auto my-4").remove("mx-auto").add("ml-4 mr-2").parse();
// my-4 ml-4 mr-2

s.from().set("space", "p-4 m-4").set("size", "w-8 h-8").delete("space").parse();
// w-8 h-8
```

## Documentation

### Parser 

The function `s.parse()` is the main function to parse classe. It takes any number of arguments of type string, array of strings or objects with string property values. It always returns a string.

```ts
import { s } from "stype";

s.parse("rounded", ["p-2", "m-2"], { width: "border-4" });
// rounded p-2 m-2 border-2
```

Arrays and objects can be nested into each other.

```ts
import { s } from "stype";

s.parse(["rounded", { spacing: ["p-2", "m-2"], width: "border-4" }]);
// rounded p-2 m-2 border-2
```

It also handles null values.

```ts
import { s } from "stype";

s.parse(null, undefined, "", {}, [], true, false);
// ""
```

### Builder

The `s.from()` function return a builder, a utility class that keep track of added and removed classes. The builder has a `builder.parse()` function that returns the string containing all classes, a `builder.add()` and a `builder.remove()` function to add and remove classes.

```ts
import { s } from "stype";

const style = s.from("flex mx-auto");
style.remove("mx-auto")
style.add("ml-2")

style.parse();
// flex ml-2
```

The builder has the `builder.set()` function that sets key-value classes and the `builder.delete()` function that delete them by their key.

```ts
import { s } from "stype";

const style = s.from("rounded");
style.set("space", "p-8 m-8");
style.set("width", "border-4");
style.delete("with");
sstyle.set("space", "p-4 m-4");

style.parse();
// rounded p-4  m-4
```

Builder funcions `builder.add()`, `builder.remove()` and `builder.set()` take the same arguments as `s.parse()` do.

```ts
import { s } from "stype";

const style = s.from("rounded");
style.add({ spacing: ["p-4", "m-4"], width: "border-4" });
style.remove(["p-4", "m-4"]).add("m-auto p-2");
style.set("color", "bg-violet-600", "border-violet-400");

style.parse();
// rounded border-4 m-auto p-2 bg-violet-600 border-violet-400
```

## Features

### Uniqueness

Classes are always unique

```ts
import { s } from "stype";

s.parse("flex", "flex");
// flex
```

## Integrations

### VS Code TailwindCSS IntelliSense

To enable TailwindCSS IntelliSense on Stype functions call, add this class regex to your `.vscode/settiongs.json`

```jsonc
{
  "tailwindCSS.experimental.classRegex": [
    // Enable IntelliSense on Stype function calls outside "className" attribute
    ["\\.(?:parse|from|add|remove)\\s*\\(\\s*([\\s\\S]*?)\\s*\\)\\s*", "[\"'`]([^\"'`]*)[\"'`]"],
  ],
}
```
