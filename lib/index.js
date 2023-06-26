var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Out_instances, _Out_actions, _Out_new, _Out_process;
function parse(...items) {
    const tokens = [];
    for (const item of items) {
        if (item instanceof Array) {
            tokens.push(...parse(...item));
        }
        else if (typeof item === "string") {
            const split = item.split(" ");
            for (const token of split) {
                if (token)
                    tokens.push(token);
            }
        }
    }
    return tokens;
}
class Out {
    constructor(actions = []) {
        _Out_instances.add(this);
        _Out_actions.set(this, []);
        __classPrivateFieldSet(this, _Out_actions, actions, "f");
    }
    add(...items) {
        return __classPrivateFieldGet(this, _Out_instances, "m", _Out_new).call(this, [{ type: "add", value: items }]);
    }
    remove(...items) {
        return __classPrivateFieldGet(this, _Out_instances, "m", _Out_new).call(this, [{ type: "remove", value: items }]);
    }
    set(...items) {
        return __classPrivateFieldGet(this, _Out_instances, "m", _Out_new).call(this, [{ type: "set", value: items }]);
    }
    apply(...patches) {
        const actions = [];
        for (const out of patches) {
            actions.push({ type: "apply", value: __classPrivateFieldGet(out, _Out_actions, "f") });
        }
        return __classPrivateFieldGet(this, _Out_instances, "m", _Out_new).call(this, actions);
    }
    with(map) {
        return __classPrivateFieldGet(this, _Out_instances, "m", _Out_new).call(this, __classPrivateFieldGet(this, _Out_instances, "m", _Out_process).call(this, map));
    }
    parse(...params) {
        let tokens = new Set();
        const actions = [...__classPrivateFieldGet(this, _Out_actions, "f")];
        for (const param of params) {
            if (typeof param === "object" &&
                param !== null &&
                !Array.isArray(param)) {
                actions.push(...__classPrivateFieldGet(this, _Out_instances, "m", _Out_process).call(this, param));
            }
            else {
                actions.push({ type: "add", value: param });
            }
        }
        while (actions.length > 0) {
            const action = actions.shift();
            if (action.type === "apply") {
                actions.push(...action.value);
            }
            else {
                const items = parse(action.value);
                if (action.type === "add") {
                    for (const item of items)
                        tokens.add(item);
                }
                else if (action.type === "remove") {
                    for (const item of items)
                        tokens.delete(item);
                }
                else if (action.type === "set") {
                    tokens = new Set(items);
                }
            }
        }
        return [...tokens].join(" ");
    }
}
_Out_actions = new WeakMap(), _Out_instances = new WeakSet(), _Out_new = function _Out_new(actions) {
    return new Out([...__classPrivateFieldGet(this, _Out_actions, "f"), ...actions]);
}, _Out_process = function _Out_process(map) {
    let actions = [];
    let type;
    for (type in map) {
        if (type === "apply") {
            let outs = map.apply;
            outs = Array.isArray(outs) ? outs : [outs];
            for (const out of outs) {
                actions.push({ type, value: __classPrivateFieldGet(out, _Out_actions, "f") });
            }
        }
        else {
            actions.push({ type, value: map[type] });
        }
    }
    return actions;
};
export default new Out();
