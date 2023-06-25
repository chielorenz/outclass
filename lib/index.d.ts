export type Value = string | undefined | null | boolean;
export type Items = Value | Items[];
export type Action = {
    type: "add" | "remove" | "set";
    value: Items;
} | {
    type: "apply";
    value: Action[];
};
export type Map = Partial<{
    set: Items;
    add: Items;
    remove: Items;
    apply: Outclass | Outclass[];
}>;
declare class Outclass {
    #private;
    constructor(actions?: Action[]);
    add(...items: Items[]): Outclass;
    remove(...items: Items[]): Outclass;
    set(...items: Items[]): Outclass;
    apply(...patches: Outclass[]): Outclass;
    with(map: Map): Outclass;
    parse(...params: (Map | Items)[]): string;
}
declare const _default: Outclass;
export default _default;
