import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { tagUnindent } from "../../../es-utils/index";
import { isImportStatement } from "./isImportStatement";

const code = tagUnindent`
    import * as x from "./somewhere"; // 0
    import "./side/effects"; // 1
    import def,{default as A, B, c as C} from "./somewhere"; // 2
    import("some/path"); // 3
    export * as x from "./somewhere"; // 4
    import foo, * as x from "./somewhere"; // 5
    import def from "./somewhere"; // 6
`;

describe(isImportStatement.name, () => {
    it(
        "returns true when provided with a namespace import",
        unitTest({
            statementIndex: 0,
            toBe: true,
        })
    );
    it(
        "returns true when provided with a side effect import",
        unitTest({
            statementIndex: 1,
            toBe: false,
        })
    );
    it(
        "returns true when provided with a named import",
        unitTest({
            statementIndex: 2,
            toBe: true,
        })
    );
    it(
        "returns false when provided with an import expression",
        unitTest({
            statementIndex: 3,
            toBe: false,
        })
    );
    it(
        "returns false when provided with a non import declaration",
        unitTest({
            statementIndex: 4,
            toBe: false,
        })
    );
    it(
        "returns true when provided with a default namespace import",
        unitTest({
            statementIndex: 5,
            toBe: true,
        })
    );
    it(
        "returns true when provided with a default import",
        unitTest({
            statementIndex: 6,
            toBe: true,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return (): void => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isImportStatement(statement)).toBe(toBe);
    };
}
