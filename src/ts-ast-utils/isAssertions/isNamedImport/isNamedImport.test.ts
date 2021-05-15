import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { isNamedImport } from "./isNamedImport";

const code = tagUnindent`
    import * as x from "./somewhere"; // 0
    import "./side/effects"; // 1
    import def,{default as A, B, c as C} from "./somewhere"; // 2
    import("some/path"); // 3
    export * as x from "./somewhere"; // 4
    import foo, * as x from "./somewhere"; // 5
    import def from "./somewhere"; // 6
    import {default as A, B, c as C} from "./somewhere"; // 7
`;

describe(isNamedImport.name, () => {
    it(
        "0",
        unitTest({
            statementIndex: 0,
            toBe: false,
        })
    );
    it(
        "1",
        unitTest({
            statementIndex: 1,
            toBe: false,
        })
    );
    it(
        "2",
        unitTest({
            statementIndex: 2,
            toBe: false,
        })
    );
    it(
        "3",
        unitTest({
            statementIndex: 3,
            toBe: false,
        })
    );
    it(
        "4",
        unitTest({
            statementIndex: 4,
            toBe: false,
        })
    );
    it(
        "5",
        unitTest({
            statementIndex: 5,
            toBe: false,
        })
    );
    it(
        "6",
        unitTest({
            statementIndex: 6,
            toBe: false,
        })
    );
    it(
        "7",
        unitTest({
            statementIndex: 7,
            toBe: true,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return (): void => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isNamedImport(statement)).toBe(toBe);
    };
}
