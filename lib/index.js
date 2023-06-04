function isArray(item) {
    return item instanceof Array;
}
function isObject(item) {
    return Object.prototype.toString.call(item) === "[object Object]";
}
function isString(item) {
    return typeof item === "string";
}
function isSet(item) {
    return item instanceof Set;
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
        else if (isString(param)) {
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
    from(...params) {
        return new Builder(params);
    }
    parse(...params) {
        return this.from(params).parse();
    }
}
class Builder {
    constructor(...params) {
        this.tokens = new Map();
        this.add(params);
    }
    add(...params) {
        for (const token of parse(params)) {
            this.tokens.set(this.tokens.size + 1, token);
        }
        return this;
    }
    remove(...params) {
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
    set(key, ...params) {
        this.tokens.set(key, parse(params));
        return this;
    }
    delete(key) {
        this.tokens.delete(key);
        return this;
    }
    parse() {
        let classes = new Set();
        for (const token of this.tokens.values()) {
            if (isSet(token)) {
                for (const value of token) {
                    classes.add(value);
                }
            }
            else {
                classes.add(token);
            }
        }
        return [...classes].join(" ");
    }
}
const stype = new Parser();
export { stype as s };
export default stype;
