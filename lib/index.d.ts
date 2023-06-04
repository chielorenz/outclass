declare namespace Stype {
    type Value = string | undefined | null | boolean;
    type Object = {
        [key: string]: Value | List | Object;
    };
    type List = Array<Value | List | Object>;
}
declare class Parser {
    from(...params: Stype.List): Builder;
    parse(...params: Stype.List): string;
}
declare class Builder {
    private tokens;
    constructor(...params: Stype.List);
    add(...params: Stype.List): Builder;
    remove(...params: Stype.List): Builder;
    set(key: string, ...params: Stype.List): Builder;
    delete(key: string): Builder;
    parse(): string;
}
declare const stype: Parser;
export { stype as s };
export default stype;
