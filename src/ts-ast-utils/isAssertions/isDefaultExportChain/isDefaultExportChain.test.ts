import { isDefaultExportChain } from "./isDefaultExportChain";
import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";

const code = tagUnindent`
    export default 3;
    export default foo;
`;

describe(isDefaultExportChain.name, () => {
    it(
        "returns false for default export non chain",
        unitTest({
            statementIndex: 0,
            toBe: false,
        })
    );
    it(
        "returns true for default export chain",
        unitTest({
            statementIndex: 1,
            toBe: true,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return (): void => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isDefaultExportChain(statement)).toBe(toBe);
    };
}
