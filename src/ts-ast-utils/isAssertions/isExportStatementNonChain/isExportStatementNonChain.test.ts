import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { tagUnindent } from "../../../es-utils/index";
import { isExportStatementNonChain } from "./isExportStatementNonChain";

const code = tagUnindent`
    type a = number; // 0
    export type a = number; // 1
    interface foo {b : string} // 2
    export interface foo {b : string} // 3

    class A { constructor() {} } // 4
    export class A { constructor() {} } // 5
    function printTips(): void {} // 6
    export function printTips(): void {} // 7
    const a = 1 , b = 2; // 8

    export const a = 1 , b = 2; // 9
    export default {a : 1, b : 2} // 10

    export default function printTips(): void {} // 11
    export default interface aa {bb : string} // 12
    export default class { constructor() {} } // 13

    export default foo; // 14
    export * as x from "./some/where"; // 15
    export * from "./some/where"; // 16
    export {A,b as B,default as C,default} from "./some/where"; // 17
    export { A, b as B, c as default }; // 18
    import * as x from "./some/where"; // 19
    import foo, {A ,default as B,c as C} from "./some/where"; // 20
`;

describe(isExportStatementNonChain.name, () => {
    it(
        "returns true for provided statement being type alias declaration non export",
        unitTest({
            statementIndex: 0,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being type alias declaration export",
        unitTest({
            statementIndex: 1,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being interface declaration non export ",
        unitTest({
            statementIndex: 2,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being interface declaration export ",
        unitTest({
            statementIndex: 3,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being class declaration export",
        unitTest({
            statementIndex: 4,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being class declaration export",
        unitTest({
            statementIndex: 5,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being function declaration",
        unitTest({
            statementIndex: 6,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being function declaration export",
        unitTest({
            statementIndex: 7,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being variable declaration non export",
        unitTest({
            statementIndex: 8,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being variable declaration export",
        unitTest({
            statementIndex: 9,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being export assignment",
        unitTest({
            statementIndex: 10,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being default export function declaration",
        unitTest({
            statementIndex: 11,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being default export interface declaration",
        unitTest({
            statementIndex: 12,
            toBe: true,
        })
    );
    it(
        "returns true for provided statement being default export class declaration",
        unitTest({
            statementIndex: 13,
            toBe: true,
        })
    );

    it(
        "returns false for provided statement being default export chain",
        unitTest({
            statementIndex: 14,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being namespace export",
        unitTest({
            statementIndex: 15,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being delegation export",
        unitTest({
            statementIndex: 16,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being named export",
        unitTest({
            statementIndex: 17,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being named export pathless",
        unitTest({
            statementIndex: 18,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being namespace import",
        unitTest({
            statementIndex: 19,
            toBe: false,
        })
    );
    it(
        "returns false for provided statement being import",
        unitTest({
            statementIndex: 20,
            toBe: false,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return (): void => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(isExportStatementNonChain(statement)).toBe(toBe);
    };
}
