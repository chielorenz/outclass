# Stype

TypeScript tool for creating class names dynamically

## Installation

```bash
npm i github:b1n01/stype
```

## Usage

Create class names

```typescript
import { st } from "stype";

// From strings
const className = st("flex flex-col");
// flex flex-col

// From arrays
const className = st(["bg-indigo-500", "hover:bg-indigo-600"]);
// bg-indigo-500 hover:bg-indigo-600

// From objects
const className = st({
  default: "text-black",
  spacing: "p-6 m-2",
});
// text-black p-6 m-2

// From multiple parameters
const className = st("h-12", "w-12");
// h-12 w-12

// From undefined or null
const className = st(undefined);
// ""
```

Cascading duplicated class names

```typescript
import { st } from "stype";

const className = st("block mx-auto", "block");
// mx-auto block
```

## Example 

Uage in a React component

```jsx
import { st } from "stype";

export function Component({ active = true, className = "rounded" }) {

  const buttonStyle = st({
    base: "rounded px-4 py-2",
    active: active ? "bg-indigo-600" : "text-neutral-600",
    className,
  });

  return (
      <div className={st("flex items-end", active ? "mt-4" : className)}>
        <button className={buttonStyle}>
          Save
        </button>
      </div>
  );
}

//  <div class="flex items-end mt-4">
//    <button class="rounded px-4 py-2 bg-indigo-600 rounded">
//      Save
//    </button>
//  </div>
```

## VS Code Tailwindcss IntelliSense

To enable Tailwindcss IntelliSense on `st()` calls, add this class regex to 
your `.vscode/settiongs.json`

```json
{
  "tailwindCSS.experimental.classRegex": [
    // Match "st" invocation outside className and class attributes
    ["st\\s*\\(\\s*{\\s*([\\s\\S]*?)\\s*}\\s*\\)\\s*;", "[\"'`]([^\"'`]*)[\"'`]"]
  ],
}
```