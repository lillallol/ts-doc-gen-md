import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { hasDefaultModifier } from "./hasDefaultModifier";

const code = tagUnindent`
    export default function foo() {}
    export type myType = number;
`;

describe(hasDefaultModifier.name, () => {
    it(
        "returns true when the provided statement has default modifier",
        unitTest({
            statementIndex: 0,
            toBe: true,
        })
    );
    it(
        "returns false when the provided statement does not have default modifier",
        unitTest({
            statementIndex: 1,
            toBe: false,
        })
    );
});

function unitTest(_: { statementIndex: number; toBe: boolean }): () => void {
    const { statementIndex, toBe } = _;
    return (): void => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        expect(hasDefaultModifier(statement)).toBe(toBe);
    };
}
