"use client";
import { useState } from "react";
import { out } from "outclass";

// This is the Outclass playground, read more https://github.com/b1n01/outclass.
// This demo is a Next.js app with TypeScript and TailwindCSS, edit "buttonStyle"
// to update the applied classes.

export default function Playground() {
  const [state, setState] = useState(false);

  let buttonStyle = out.add("rounded bg-neutral-200 text-neutral-900 p-2 px-4 mb-8");

  if (state) {
    buttonStyle = buttonStyle
      .remove("bg-neutral-200 text-neutral-900")
      .add("bg-violet-600 text-neutral-200");
  }

  const classes = buttonStyle.parse();

  return (
    <main>
      <button onClick={() => setState(!state)} className={classes}>
        Toggle state
      </button>
      <div>
        <p>Applied classes:</p>
        <code>{classes}</code>
      </div>
    </main>
  );
}
