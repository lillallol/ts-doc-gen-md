import { getSourceFileOf } from "./getSourceFileOf";
import * as path from "path";

describe(getSourceFileOf.name, () => {
    it("creates an abstract syntax tree of the file that corresponds to the provided path", () => {
        const { text } = getSourceFileOf(path.resolve(__dirname, "file.mock.ts"));
        expect(text).toBe(`export const thisIsA = "mock test file";`); //@TODO I have to find a better test
    });
});
