function parse(...params) {
    const tokens = new Set();
    function eat(param) {
        if (param instanceof Array) {
            return parse(...param);
        }
        else if (typeof param === "string") {
            return param.split(" ");
        }
        else {
            return [];
        }
    }
    for (const param of params) {
        for (const token of eat(param)) {
            if (token)
                tokens.add(token);
        }
    }
    return tokens;
}
class Parser {
    parse(...params) {
        return [...parse(params)].join(" ");
    }
    get layer() {
        return new Layer();
    }
    get slot() {
        return new Slot();
    }
}
class Layer {
    constructor() {
        this.actions = [];
        this.patches = [];
    }
    add(...params) {
        this.actions.push({ type: "add", tokens: parse(params) });
        return this;
    }
    remove(...params) {
        this.actions.push({ type: "remove", tokens: parse(params) });
        return this;
    }
    set(...params) {
        this.actions.push({ type: "set", tokens: parse(params) });
        return this;
    }
    apply(...patches) {
        this.patches.push(...patches);
        return this;
    }
    with(actions) {
        let type;
        for (type in actions) {
            if (type === "patch") {
                const patch = actions[type];
                if (patch)
                    "type" in patch ? this.apply(patch) : this.apply(...patch);
            }
            else {
                const tokens = parse(actions[type]);
                this.actions.push({ type, tokens });
            }
        }
        return this;
    }
    get patch() {
        return { type: "patch", actions: this.actions };
    }
    parse(actions) {
        if (actions)
            this.with(actions);
        let tokens = new Set();
        function eat(action) {
            if (action.type === "add") {
                action.tokens.forEach((token) => tokens.add(token));
            }
            else if (action.type === "remove") {
                action.tokens.forEach((token) => tokens.delete(token));
            }
            else if (action.type === "set") {
                tokens = action.tokens;
            }
        }
        this.actions.forEach(eat);
        this.patches.forEach((patch) => patch.actions.forEach(eat));
        return [...tokens].join(" ");
    }
}
class Slot {
    constructor() {
        this.slots = new Map();
    }
    set(key, ...params) {
        if (!this.slots.has(key)) {
            this.slots.set(key, out.parse(params));
        }
        return this;
    }
    with(config) {
        for (const [key, values] of Object.entries(config)) {
            this.set(key, values);
        }
        return this;
    }
    parse(config) {
        if (config)
            this.with(config);
        return [...this.slots.values()].join(" ");
    }
}
const out = new Parser();
export { out };
