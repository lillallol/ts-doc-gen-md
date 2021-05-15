import { getNamesFromExportStatement } from "./getNamesFromExportStatement";
import { isExportStatement } from "../../isAssertions/isExportStatement";
import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";

//@TODO I should add export statements non chain without export modifiers
const code = tagUnindent`
    export class A { constructor() {} }
    export default foo;
    export function foo() {}
    export interface I {a: number;}
    export type n = number;

    export { default, A, b as B, default as C } from "./some/other/place";
    export { a as default, b as B, C }
    export * as x from "./some/where";

    export const a = 1,b = 2;
    
    export * from "./some/where";
`;

describe(getNamesFromExportStatement.name, () => {
    it(
        "returns the name of the provided class declaration",
        unitTest({
            statementIndex: 0,
            toEqual: ["A"],
        })
    );
    it(
        "returns the name of the provided default export chain",
        unitTest({
            statementIndex: 1,
            toEqual: ["default"],
        })
    );
    it(
        "returns the name of the provided function declaration",
        unitTest({
            statementIndex: 2,
            toEqual: ["foo"],
        })
    );
    it(
        "returns the name of the provided interface declaration",
        unitTest({
            statementIndex: 3,
            toEqual: ["I"],
        })
    );
    it(
        "returns the name of the provided type alias declaration",
        unitTest({
            statementIndex: 4,
            toEqual: ["n"],
        })
    );
    it(
        "returns the name of the provided path full named export statement",
        unitTest({
            statementIndex: 5,
            toEqual: ["default", "A", "B", "C"],
        })
    );
    it(
        "returns the name of the provided pathless named export statement",
        unitTest({
            statementIndex: 6,
            toEqual: ["default", "B", "C"],
        })
    );
    it(
        "returns the name of the provided namespace export statement",
        unitTest({
            statementIndex: 7,
            toEqual: ["x"],
        })
    );
    it(
        "returns the name of the provided variable declaration statement",
        unitTest({
            statementIndex: 8,
            toEqual: ["a", "b"],
        })
    );
    it(
        "returns the name of the provided delegation export",
        unitTest({
            statementIndex: 9,
            toEqual: undefined,
        })
    );
});

function unitTest(_: { statementIndex: number; toEqual: string[] | undefined }): () => void {
    const { statementIndex, toEqual } = _;
    return (): void => {
        const s = createMockSourceFile(code).statements[statementIndex];
        if (!isExportStatement(s)) throw Error();
        expect(getNamesFromExportStatement(s)).toEqual(toEqual);
    };
}
