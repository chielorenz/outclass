export type Value = string | undefined | null | boolean;

export type Item = Value | List;

export type List = Array<Item>;

export type Action = {
  type: "add" | "remove" | "set";
  tokens: Set<string>;
};

export type Patch = {
  type: "patch";
  actions: Action[];
};

export type ConfigMap = {
  add: List;
  remove: List;
  set: List;
  patch: Patch | Patch[];
};

function isList(item: any): item is List {
  return Object.prototype.toString.call(item) === "[object Array]";
}

function isString(item: any): item is string {
  return Object.prototype.toString.call(item) === "[object String]";
}

function isPatchArray(item: any): item is Patch[] {
  let isPatchArray = false;
  if (item instanceof Array) {
    isPatchArray = true;
    for (const patch of item) {
      isPatchArray = isPatchArray && patch?.type === "patch";
    }
  }

  return isPatchArray;
}

function parse(...params: List): Set<string> {
  const tokens = new Set<string>();

  function eat(param: Item): Set<string> {
    if (isList(param)) {
      return parse(...param);
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
  public parse(...params: List): string {
    return [...parse(params)].join(" ");
  }

  get layer(): Layer {
    return new Layer();
  }
}

class Layer {
  private actions: Action[] = [];
  private patches: Patch[] = [];

  public add(...params: List): Layer {
    this.actions.push({ type: "add", tokens: parse(params) });
    return this;
  }

  public remove(...params: List): Layer {
    this.actions.push({ type: "remove", tokens: parse(params) });
    return this;
  }

  public set(...params: List): Layer {
    this.actions.push({ type: "set", tokens: parse(params) });
    return this;
  }

  public apply(...patches: Patch[]): Layer {
    this.patches.push(...patches);
    return this;
  }

  public with(actions: ConfigMap): Layer {
    let type: keyof ConfigMap;
    for (type in actions) {
      if (type === "patch") {
        const patch = actions[type];
        isPatchArray(patch) ? this.apply(...patch) : this.apply(patch);
      } else {
        const tokens = parse(actions[type]);
        this.actions.push({ type, tokens });
      }
    }
    return this;
  }

  get patch(): Patch {
    return { type: "patch", actions: this.actions };
  }

  public parse(actions: ConfigMap): string {
    this.with(actions);
    let tokens = new Set<string>();

    function eat(action: Action) {
      if (action.type === "add") {
        action.tokens.forEach((token) => tokens.add(token));
      } else if (action.type === "remove") {
        action.tokens.forEach((token) => tokens.delete(token));
      } else if (action.type === "set") {
        tokens = action.tokens;
      }
    }

    this.actions.forEach(eat);
    this.patches.forEach((patch) => patch.actions.forEach(eat));

    return [...tokens].join(" ");
  }
}

const out = new Parser();
export { out };
