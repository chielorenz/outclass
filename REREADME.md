# Outclass

> Currently in pre-release version, expect breaking changes.

Outclass is a TypeScript CSS class composition library with an immutable and composable API for building UI component styles using variants, slots, and modifiers, for example:

```tsx
import { out } from "outclass";
import { twMerge } from "tailwind-merge";

const alertClass = out.class(
  // Base styling
  "border box",

  // Add 'size' variant
  out.variant("size", {
    sm: "p-2",
    default: "p-4",
    lg: "p-8",
  }),

  // Create the 'title' slot
  out.slot("title").class(
    // Style the 'title' slot
    "flex m-2",

    // Add the 'level' variant
    out.variant("level", {
      default: "black",
      warning: "orange",
      danger: "red",
    }),
  ),

  // Use tailwind-merge
  out.use(twMerge),
);

function Alert({ size, level }: VariantsOf<typeof alertClass>) {
  // Generate class srings for each slot, using selected variants
  const { defaultClass, titleClass } = alertClass({
    size: "lg",
    level: "danger",
  });

  return (
    <div className={defaultClass}>
      <span className={titleClass}>Title</span>
    </div>
  );
}
```
