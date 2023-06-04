namespace Stype {
  export type Value = string | undefined | null | boolean;

  export type Object = {
    [key: string]: Value | List | Object;
  };

  export type List = Array<Value | List | Object>;
}

function isArray(item: unknown): item is Stype.List {
  return item instanceof Array;
}

function isObject(item: unknown): item is Stype.Object {
  return Object.prototype.toString.call(item) === "[object Object]";
}

function isString(item: unknown): item is string {
  return typeof item === "string";
}

function isSet(item: unknown): item is Set<string> {
  return item instanceof Set;
}

function parse(...params: Stype.List): Set<string> {
  const tokens = new Set<string>();

  for (const param of params) {
    let next = new Set<string>();
    if (isArray(param)) {
      next = parse(...param);
    } else if (isObject(param)) {
      next = parse(...Object.values(param));
    } else if (isString(param)) {
      param
        .split(" ")
        .filter((token) => token)
        .forEach((token) => next.add(token));
    }

    for (const token of next) {
      tokens.add(token);
    }
  }

  return tokens;
}

class Parser {
  public from(...params: Stype.List): Builder {
    return new Builder(params);
  }

  public parse(...params: Stype.List): string {
    return this.from(params).parse();
  }
}

class Builder {
  private tokens = new Map<number | string, string | Set<string>>();

  constructor(...params: Stype.List) {
    this.add(params);
  }

  public add(...params: Stype.List): Builder {
    for (const token of parse(params)) {
      this.tokens.set(this.tokens.size + 1, token);
    }
    return this;
  }

  public remove(...params: Stype.List): Builder {
    for (const token of parse(params)) {
      for (const [key, value] of this.tokens.entries()) {
        if (token === value) {
          this.tokens.delete(key);
          break;
        }
      }
    }
    return this;
  }

  public set(key: string, ...params: Stype.List): Builder {
    this.tokens.set(key, parse(params));
    return this;
  }

  public delete(key: string): Builder {
    this.tokens.delete(key);
    return this;
  }

  public parse(): string {
    let classes = new Set<string>();
    for (const token of this.tokens.values()) {
      if (isSet(token)) {
        for (const value of token) {
          classes.add(value);
        }
      } else {
        classes.add(token);
      }
    }

    return [...classes].join(" ");
  }
}

const stype = new Parser();
export { stype as s };
export default stype;
