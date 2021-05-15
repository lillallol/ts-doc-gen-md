import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { isInvalidStatement } from "./isInvalidStatement";

describe(isInvalidStatement.name, () => {
    it(
        "returns true for export assignment for common js",
        unitTest({
            mockCode: `
                export = 1;
            `,
            output: true,
        })
    );
    it(
        "returns true for typescript namespace",
        unitTest({
            mockCode: `
                namespace foo {

                }
            `,
            output: true,
        })
    );
    it(
        "returns true for import assignment for common js",
        unitTest({
            mockCode: `
                import a = require("a");
            `,
            output: true,
        })
    );
    it(
        "returns false for everything else",
        unitTest({
            mockCode: `
                export default 1;
            `,
            output: false,
        })
    );
});

function unitTest(_: { mockCode: string; output: boolean }) {
    return () => {
        const { output, mockCode } = _;
        const s = createMockSourceFile(mockCode).statements[0];
        expect(isInvalidStatement(s)).toBe(output);
    };
}
