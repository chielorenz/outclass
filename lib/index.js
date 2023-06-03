function isArray(item) {
    return Array.isArray(item);
}
function isObject(item) {
    return typeof item === "object" && item !== null;
}
function parse(...params) {
    const tokens = new Set();
    for (const param of params) {
        let next = new Set();
        if (isArray(param)) {
            next = parse(...param);
        }
        else if (isObject(param)) {
            next = parse(...Object.values(param));
        }
        else if (param) {
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
    from: function (...params) {
        return new Builder(params);
    },
    parse: function (...params) {
        return [...parse(params)].join(" ");
    },
};
class Builder {
    constructor(...params) {
        this.tokens = new Set();
        this.add(params);
    }
    add(...params) {
        for (const token of parse(params)) {
            this.tokens.delete(token);
            this.tokens.add(token);
        }
        return this;
    }
    remove(...params) {
        for (const token of parse(params)) {
            this.tokens.delete(token);
        }
        return this;
    }
    parse() {
        return [...this.tokens].join(" ");
    }
}
export { stype as s };
