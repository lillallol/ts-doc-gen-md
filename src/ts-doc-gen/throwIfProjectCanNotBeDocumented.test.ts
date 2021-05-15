import { throwIfProjectCanNotBeDocumented } from "./throwIfProjectCanNotBeDocumented";

describe(throwIfProjectCanNotBeDocumented.name, () => {
    it.each<[{ path: string }]>([
        [
            {
                path: "./node_modules/typescript/lib/typescript.d.ts",
            },
            // @TODO a case that can be documented
        ],
    ])("returns a predicate on whether the provided project can be documented or not", ({ path }) => {
        expect(() => throwIfProjectCanNotBeDocumented(path)).toThrow();
    });
});
