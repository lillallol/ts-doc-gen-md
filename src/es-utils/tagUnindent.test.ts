import { tagUnindent } from "./tagUnindent";

describe(tagUnindent.name, () => {
    describe("removes the first and last line and then the maximum common indentation from the provided template literal", () => {
        
        
        it("works for no placeholders", () => {
            expect(tagUnindent`
                    Hello

                        world
                !
            `).toBe(
                // prettier-ignore
                "    Hello\n" +
                "\n" +
                "        world\n" + 
                "!"
            );
        });
        it("works for string and number placeholders", () => {
            expect(tagUnindent`
                export function ${"foo"}():number {
                    return ${1};
                }
            `).toBe(
                // prettier-ignore
                "export function foo():number {\n" +
                "    return 1;\n" + 
                "}"
            );
        });
        it("replaces single element string arrays placeholders with their multi-line indented string", () => {
            expect(tagUnindent`
                path : (${`"./some/where"`})
                index : ${0}
                message : 
                    ${["hello\nworld"]}
            `).toBe(
                // prettier-ignore
                `path : ("./some/where")\n` +
                `index : 0\n` +
                `message : \n` +
                `    hello\n` +
                `    world`
            );
        });
    });
});
