import { isObject } from "./isObject";

describe(isObject.name, () => {
    it.each<[{ input: unknown; output: boolean }]>([
        [{ input: 1, output: false }],
        [{ input: "", output: false }],
        [{ input: true, output: false }],
        [{ input: null, output: false }],
        [{ input: undefined, output: false }],
        [{ input: [], output: true }],
        [{ input: () => undefined, output: false }],
        [{ input: {}, output: true }],
        [{ input: Symbol(), output: false }],
        [{ input: 2n, output: false }],
    ])("returns true only when typeof gives object and the value is not null", ({ input, output }) => {
        expect(isObject(input)).toBe(output);
    });
});
