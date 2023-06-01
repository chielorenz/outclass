export type StyleValue = string | undefined | null;
export type StyleObject = {
    [key: string]: StyleValue | StyleArray | StyleObject;
};
export type StyleArray = Array<StyleValue | StyleArray | StyleObject>;
export declare function st(...props: StyleArray): string;
