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

function parse(...params: StyleArray): Set<string> {
  const tokens = new Set<string>();

  for (const param of params) {
    let next: Set<string> = new Set<string>();
    if (isArray(param)) {
      next = parse(...param);
    } else if (isObject(param)) {
      next = parse(...Object.values(param));
    } else if (param) {
      param
        .split(" ")
        .filter((token) => token)
        .map((token) => token.trim())
        .forEach((token) => {
          next.delete(token);
          next.add(token);
        });
    }

    for (const token of next) {
      tokens.delete(token);
      tokens.add(token);
    }
  }

  return tokens;
}

const stype = {
  from: function (...params: StyleArray): Builder {
    return new Builder(params);
  },

  parse: function (...params: StyleArray): string {
    return [...parse(params)].join(" ");
  },
};

class Builder {
  private tokens = new Set<string>();

  constructor(...params: StyleArray) {
    this.add(params);
  }

  public add(...params: StyleArray): Builder {
    for (const token of parse(params)) {
      this.tokens.delete(token);
      this.tokens.add(token);
    }

    return this;
  }

  public remove(...params: StyleArray): Builder {
    for (const token of parse(params)) {
      this.tokens.delete(token);
    }

    return this;
  }

  public parse() {
    return [...this.tokens].join(" ");
  }
}

export { stype as s };
