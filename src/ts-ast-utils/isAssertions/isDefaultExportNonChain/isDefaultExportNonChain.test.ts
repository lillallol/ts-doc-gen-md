import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { isDefaultExportNonChain } from "./isDefaultExportNonChain";

const code = `
    export default foo;
    export default 1;
    export default function foo() {}
    export default class {
        constructor() {}
    }
    export function foo() {};
`;

describe(isDefaultExportNonChain.name, () => {
    it("returns false for default export chain", unitTest({
        statementIndex : 0,
        toBe  :false
    }));
    it("returns true for default export non chain of literal", unitTest({
        statementIndex : 1,
        toBe  : true
    }));
    it("returns true for default export non chain of function declaration", unitTest({
        statementIndex : 2,
        toBe  : true
    }));
    it("returns true for default export non chain of class declaration", unitTest({
        statementIndex : 3,
        toBe  : true
    }));
    it("returns false for export that is not default", unitTest({
        statementIndex : 4,
        toBe  : false
    }));
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return () => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isDefaultExportNonChain(statement)).toBe(toBe);
    };
}
