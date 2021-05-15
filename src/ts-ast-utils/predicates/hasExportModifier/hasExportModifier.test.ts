import { hasExportModifier } from "./hasExportModifier";
import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";

const code = tagUnindent`
    export default function foo() {}
    type myType = number;
`;

describe(hasExportModifier.name, () => {
    it(
        "returns true when the provided statement has export modifier",
        unitTest({
            statementIndex: 0,
            toBe: true,
        })
    );
    it(
        "returns false when the provided statement does not have export modifier",
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
        expect(hasExportModifier(statement)).toBe(toBe);
    };
}
