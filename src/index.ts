export type StyleValue = string | undefined | null;

export type StyleObject = {
  [key: string]: StyleValue | StyleArray | StyleObject;
};

export type StyleArray = Array<StyleValue | StyleArray | StyleObject>;

function isArray(item: unknown): item is StyleArray {
  return Array.isArray(item);
}

function isObject(item: unknown): item is StyleObject {
  return typeof item === "object" && item !== null;
}

export function st(...props: StyleArray): string {
  const classes = new Set();

  for (const prop of props) {
    let next = "";
    if (isArray(prop)) {
      next = st(...prop);
    } else if (isObject(prop)) {
      next = st(...Object.values(prop));
    } else if (prop) {
      next = prop;
    }

    const tokens = next
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t);

    for (const token of tokens) {
      if (classes.has(token)) {
        classes.delete(token);
      }
      classes.add(token);
    }
  }

  return [...classes].join(" ");
}
