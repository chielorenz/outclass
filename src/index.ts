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

export type LayerMap = {
  add: List;
  remove: List;
  set: List;
  patch: Patch | Patch[];
};

export type SlotMap = {
  [key: string]: Item;
};

function parse(...params: List): Set<string> {
  const tokens = new Set<string>();

  function eat(param: Item): Iterable<string> {
    if (param instanceof Array) {
      return parse(...param);
    } else if (typeof param === "string") {
      return param.split(" ");
    } else {
      return [];
    }
  }

  for (const param of params) {
    for (const token of eat(param)) {
      if (token) tokens.add(token);
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

  get slot(): Slot {
    return new Slot();
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

  public with(actions: LayerMap): Layer {
    let type: keyof LayerMap;
    for (type in actions) {
      if (type === "patch") {
        const patch = actions[type];
        "type" in patch ? this.apply(patch) : this.apply(...patch);
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

  public parse(actions?: LayerMap): string {
    if (actions) this.with(actions);
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

class Slot {
  private slots = new Map<string, string>();

  public set(key: string, ...params: List): Slot {
    if (!this.slots.has(key)) {
      this.slots.set(key, out.parse(params));
    }
    return this;
  }

  public with(config: SlotMap): Slot {
    for (const [key, values] of Object.entries(config)) {
      this.set(key, values);
    }
    return this;
  }

  public parse(config?: SlotMap): string {
    if (config) this.with(config);
    return [...this.slots.values()].join(" ");
  }
}

const out = new Parser();
export { out };
