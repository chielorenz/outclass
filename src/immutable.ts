export type Value = string | undefined | null | boolean;

export type Item = Value | Array<Item>;

export type Action = {
  type: "add" | "remove" | "set";
  items: Item;
};

export type Patch = {
  type: "patch";
  actions: Action[];
};

export type Map = {
  set?: Item;
  add?: Item;
  remove?: Item;
  patch?: Patch | Patch[];
};

function parse(...params: Item[]): Set<string> {
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

class Outclass {
  private actions: Action[] = [];
  private patches: Patch[] = [];

  public constructor(actions: Action[] = [], patches: Patch[] = []) {
    this.actions = actions;
    this.patches = patches;
  }

  private mitosis(actions: Action[] = [], patches: Patch[] = []) {
    return new Outclass(
      [...this.actions, ...actions],
      [...this.patches, ...patches]
    );
  }

  private parseMap(map: Map): [actions: Action[], patches: Patch[]] {
    let actions: Action[] = [];
    let patches: Patch[] = [];

    let type: keyof Map;
    for (type in map) {
      if (type === "patch") {
        const patch = map[type];
        if (patch)
          "type" in patch ? patches.push(patch) : patches.push(...patch);
      } else {
        const items = map[type];
        actions.push({ type, items });
      }
    }

    return [actions, patches];
  }

  public add(...items: Item[]): Outclass {
    return this.mitosis([{ type: "add", items }]);
  }

  public remove(...items: Item[]): Outclass {
    return this.mitosis([{ type: "remove", items }]);
  }

  public set(...items: Item[]): Outclass {
    return this.mitosis([{ type: "set", items }]);
  }

  public apply(...patches: Patch[]): Outclass {
    return this.mitosis([], patches);
  }

  public with(map: Map): Outclass {
    return this.mitosis(...this.parseMap(map));
  }

  public parse(map?: Map): string {
    let tokens = new Set<string>();
    const actions = [...this.actions];
    const patches = [...this.patches];

    if (map) {
      const [mapActions, mapPatches] = this.parseMap(map);
      actions.push(...mapActions);
      patches.push(...mapPatches);
    }

    function eat(action: Action) {
      const parsed = parse(action.items);
      if (action.type === "add") {
        parsed.forEach((item) => tokens.add(item));
      } else if (action.type === "remove") {
        parsed.forEach((item) => tokens.delete(item));
      } else if (action.type === "set") {
        tokens = parsed;
      }
    }

    actions.forEach(eat);
    patches.forEach((patch) => patch.actions.forEach(eat));

    return [...tokens].join(" ");
  }

  public patch(map?: Map): Patch {
    const actions = [...this.actions];
    const patches = [...this.patches];

    if (map) {
      const [mapActions, mapPatches] = this.parseMap(map);
      actions.push(...mapActions);
      patches.push(...mapPatches);
    }

    for (const patch of patches) {
      actions.push(...patch.actions);
    }

    return { type: "patch", actions };
  }
}

const out = new Outclass();

export { out };
