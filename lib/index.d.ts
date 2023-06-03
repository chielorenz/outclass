export type StyleValue = string | undefined | null;
export type StyleObject = {
    [key: string]: StyleValue | StyleArray | StyleObject;
};
export type StyleArray = Array<StyleValue | StyleArray | StyleObject>;
declare const stype: {
    from: (...params: StyleArray) => Builder;
    parse: (...params: StyleArray) => string;
};
declare class Builder {
    private tokens;
    constructor(...params: StyleArray);
    add(...params: StyleArray): Builder;
    remove(...params: StyleArray): Builder;
    parse(): string;
}
export { stype as s };
