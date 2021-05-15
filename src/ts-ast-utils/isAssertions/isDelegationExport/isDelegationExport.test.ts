import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { tagUnindent } from "../../../es-utils/index";
import { isDelegationExport } from "./isDelegationExport";

const code = tagUnindent`
    export * from "./some/where";
    export * as x from "./some/where";
    export { A, b as B, default as C, default } from "./some/where";
    export default foo;
    export { A, b as B, c as default };
    export default 1;
`;

describe(isDelegationExport.name, () => {
    it(
        "returns true when the provided statement is delegation export",
        unitTest({
            statementIndex: 0,
            toBe: true,
        })
    );
    it(
        "returns false when the provided statement is namespace export",
        unitTest({
            statementIndex: 1,
            toBe: false,
        })
    );
    it(
        "returns false when the provided statement is named export",
        unitTest({
            statementIndex: 2,
            toBe: false,
        })
    );
    it(
        "returns false when the provided statement is default export chain",
        unitTest({
            statementIndex: 3,
            toBe: false,
        })
    );
    it(
        "returns false when the provided statement is named export pathless",
        unitTest({
            statementIndex: 4,
            toBe: false,
        })
    );
    it(
        "returns false when the provided statement is default export non chain",
        unitTest({
            statementIndex: 4,
            toBe: false,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return () => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isDelegationExport(statement)).toBe(toBe);
    };
}
