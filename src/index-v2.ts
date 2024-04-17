class O {
  #base: string = "";
  #variants: Array<{ [key: string]: string }> = [];
  #defaults: string = "";

  constructor(
    base: string = "",
    variants: Array<{ [key: string]: string }> = [],
    defaults: string = ""
  ) {
    this.#base = base;
    this.#variants = variants;
    this.#defaults = defaults;
  }

  base(base: string): O {
    return new O(base, this.#variants, this.#defaults);
  }

  variants(variants: Array<{ [key: string]: string }>): O {
    return new O(this.#base, variants, this.#defaults);
  }

  defaults(defaults: string = ""): O {
    return new O(this.#base, this.#variants, defaults);
  }

  pick(pick: string = ""): string {
    const picks = pick.split(" ");
    let defaults = this.#defaults.split(" ");
    const classes: string[] = [];

    // Merge picks and defaults variants
    for (const variant of this.#variants) {
      for (const key of Object.keys(variant)) {
        const otherKeys = Object.keys(variant);
        const keys = key.split(" ");
        if (keys.every((p) => picks.includes(p))) {
          for (const otherKey of otherKeys) {
            const isCompound = otherKey.includes(" ");
            if (!isCompound) {
              defaults = defaults.filter((i) => i != otherKey);
            }
          }
        }
      }
    }

    picks.unshift(...defaults);

    // Build the classes array
    for (const variant of this.#variants) {
      const counts: string[] = [];
      for (const [key, value] of Object.entries(variant)) {
        const keys = key.split(" ");
        if (keys.every((p) => picks.includes(p))) {
          counts[keys.length] = value;
        }
      }
      if (counts.length) {
        const value = counts.pop() ?? "";
        classes.push(value);
      }
    }

    const baseClasses = this.#base ? this.#base.split(" ") : [];
    return [...baseClasses, ...classes].join(" ");
  }
}

const o = new O();

export { o };
