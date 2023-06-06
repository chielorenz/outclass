namespace Stype {
  export type Value = string | undefined | null | boolean;

  export type Object = {
    [key: string]: Value | List | Object;
  };

  export type Item = Value | List | Object;

  export type List = Array<Item>;

  export type ActionTypes = "add" | "remove" | "set" | string;

  export type Action = {
    type: ActionTypes;
    tokens: Set<string>;
  };

  export type ActionMap = { [key in ActionTypes]: List };

  export type Patch = Action[];
}

function isArray(item: unknown): item is Stype.List {
  return Object.prototype.toString.call(item) === "[object Array]";
}

function isObject(item: unknown): item is Stype.Object {
  return Object.prototype.toString.call(item) === "[object Object]";
}

function isString(item: unknown): item is string {
  return Object.prototype.toString.call(item) === "[object String]";
}

function parse(...params: Stype.List): Set<string> {
  const tokens = new Set<string>();

  function eat(param: Stype.Item): Set<string> {
    if (isArray(param)) {
      return parse(...param);
    } else if (isObject(param)) {
      return parse(...Object.values(param));
    } else if (isString(param)) {
      return new Set(param.split(" ").filter((token) => token));
    } else {
      return new Set();
    }
  }

  for (const param of params) {
    for (const token of eat(param)) {
      tokens.add(token);
    }
  }

  return tokens;
}

class Parser {
  public parse(...params: Stype.List): string {
    return [...parse(params)].join(" ");
  }

  public layer(): Layer {
    return new Layer();
  }
}

class Layer {
  private actions: Stype.Action[] = [];
  private patches: Stype.Patch[] = [];

  public add(...params: Stype.List): Layer {
    this.actions.push({ type: "add", tokens: parse(params) });
    return this;
  }

  public remove(...params: Stype.List): Layer {
    this.actions.push({ type: "remove", tokens: parse(params) });
    return this;
  }

  public set(...params: Stype.List): Layer {
    this.actions.push({ type: "set", tokens: parse(params) });
    return this;
  }

  public with(actions: Stype.ActionMap): Layer {
    for (const type in actions) {
      const tokens = parse(actions[type]);
      this.actions.push({ type, tokens });
    }
    return this;
  }

  public apply(...patches: Stype.Patch[]): Layer {
    for (const patch of patches) {
      this.patches.push(patch);
    }
    return this;
  }

  public patch(): Stype.Patch {
    return this.actions;
  }

  public parse(): string {
    let tokens = new Set<string>();

    function eat(action: Stype.Action) {
      if (action.type === "add") {
        action.tokens.forEach((token) => tokens.add(token));
      } else if (action.type === "remove") {
        action.tokens.forEach((token) => tokens.delete(token));
      } else if (action.type === "set") {
        tokens = action.tokens;
      }
    }

    this.actions.forEach(eat);
    this.patches.forEach((patch) => patch.forEach(eat));

    return [...tokens].join(" ");
  }
}

const s = new Parser();
export { s };
