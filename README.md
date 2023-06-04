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

Creating classes from various input

```ts
import { s } from "stype";

s.parse("flex flex-col");
// flex flex-col

s.parse(["mx-auto my-2", "px-2"]);
// mx-auto my-2 px-2

s.parse({ size: "text-lg", weight: "font-bold" });
// text-lg font-bold
```

Using `s.from()` gives you a 'builder'

```ts
import { s } from "stype";

s.from("flex flex-col").parse();
// flex flex-col

s.from("mx-auto my-4").remove("mx-auto").add("ml-4 mr-2").parse();
// my-4 ml-4 mr-2
```

Creating classes for a React component

```tsx
import { s } from "stype";

function Button({ active = true, spacing = ["p-4", "m-4"] }) {

    const buttonStyle = s.from({
        base: "rounded",
        bg: active ? "bg-indigo-600" : "text-neutral-600",
        spacing,
    });

    if (active) {
        buttonStyle.add("cursor-pointer");
    }

    return (
        <button className={buttonStyle.parse()}>
            <span className={s.parse("text-sm", active ? "font-bold" : null)}>
                Action
            </span>
        </button>
    );
}

// <button class="rounded bg-indigo-600 p-4 m-4 cursor-pointer">
//     <span class="text-sm font-bold">
//         Action
//     </span>
// </button>
```

## Parsing

The `s.parse` function always returns a string and takes any number of arguments of type:
- string
- array of strings
- objects with string property values

```ts
import { s } from "stype";

s.parse("rounded", ["p-2", "m-2"], { width: "border-4" });
// rounded p-2 m-2 border-2
```

Arrays and objects can be nested into each other

```ts
import { s } from "stype";

s.parse(["rounded", { spacing: ["p-2", "m-2"], width: "border-4" }]);
// rounded p-2 m-2 border-2
```

It also handles null values

```ts
import { s } from "stype";

s.parse("", null, undefined, false);
// ""
```

## Builder

The `s.from` function return a builder, a utility class that keep track of added and removed classes. The builder has a `parse` function that returns the string containing all classes.

```ts
import { s } from "stype";

const style = s.from("flex mx-auto");
style.remove("mx-auto")
style.add("ml-2")

style.parse();
// flex ml-2
```

Builder functions `from`, `add` and `remove` take the same arguments as `s.parse`

```ts
import { s } from "stype";

const style = s.from("rounded");
style.add({ spacing: ["p-4", "m-4"], width: "border-4" });
style.remove(["p-4", "m-4"]).add("m-auto p-2");

style.parse();
// rounded border-4 m-auto p-2
```

## Features

### Uniqueness

Classes are always unique

```ts
import { s } from "stype";

s.parse("flex", "flex");
// flex
```

### Cascading

Duplicate classes that are added later take the place of existing ones

```ts
import { s } from "stype";

s.parse("p-4", "mx-auto", "p-4");
// mx-auto p-4
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
