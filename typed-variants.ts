type Narrow<Type extends string[]> = Extract<Type, string> | Type[number][];

function hello<Options extends string[]>(
  variants: Narrow<Options>,
  defaultValue: Options[number]
): void {}

hello(["Hello", "World"], "Hello");

// See https://stackoverflow.com/questions/69821826/typescript-string-autocomplete-object-structure-midway
