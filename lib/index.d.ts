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
    add?: Item;
    remove?: Item;
    set?: Item;
    patch?: Patch | Patch[];
};
export type SlotMap = {
    [key: string]: Item;
};
declare class Parser {
    parse(...params: List): string;
    get layer(): Layer;
    get slot(): Slot;
}
declare class Layer {
    private actions;
    private patches;
    add(...params: List): Layer;
    remove(...params: List): Layer;
    set(...params: List): Layer;
    apply(...patches: Patch[]): Layer;
    with(actions: LayerMap): Layer;
    get patch(): Patch;
    parse(actions?: LayerMap): string;
}
declare class Slot {
    private slots;
    set(key: string, ...params: List): Slot;
    with(config: SlotMap): Slot;
    parse(config?: SlotMap): string;
}
declare const out: Parser;
export { out };
