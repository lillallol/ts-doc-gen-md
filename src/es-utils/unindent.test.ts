import { unindent, _errorMessage } from "./unindent";

describe(unindent.name, () => {
    it("throws error when the first line is not an empty string", () => {
        expect(() => unindent("a\na")).toThrow(_errorMessage.badFirstLine);
    });
    it("throws error when the last line is not only space characters", () => {
        expect(() => unindent(`\na\na`)).toThrow(_errorMessage.badLastLine);
    });
    it("removes the last and first line and un indents all non empty lines based on the common max indentation among non empty lines", () => {
        const unFixedString = `
                     transaction tree string representation
                    
                |_ "p"
                   |_ "a"
                      |_ "t"
                         |_ "h"
                         |  |_ "prop1" -1 => 1
                         |_ "t"
                            |_ "prop" "11" => "1"
        `;
        const fixedString =
            // prettier-ignore
            `     transaction tree string representation\n` +
            `    \n` +
            `|_ "p"\n` +
            `   |_ "a"\n` +
            `      |_ "t"\n` +
            `         |_ "h"\n` +
            `         |  |_ "prop1" -1 => 1\n` +
            `         |_ "t"\n` +
            `            |_ "prop" "11" => "1"`;
        expect(unindent(unFixedString)).toBe(fixedString);
    });
});
