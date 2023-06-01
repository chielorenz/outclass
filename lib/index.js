function isArray(item) {
    return Array.isArray(item);
}
function isObject(item) {
    return typeof item === "object" && item !== null;
}
export function st(...props) {
    const classes = new Set();
    for (const prop of props) {
        let next = "";
        if (isArray(prop)) {
            next = st(...prop);
        }
        else if (isObject(prop)) {
            next = st(...Object.values(prop));
        }
        else if (prop) {
            next = prop;
        }
        const tokens = next
            .split(" ")
            .map((t) => t.trim())
            .filter((t) => t);
        for (const token of tokens) {
            if (classes.has(token)) {
                classes.delete(token);
            }
            classes.add(token);
        }
    }
    return [...classes].join(" ");
}
