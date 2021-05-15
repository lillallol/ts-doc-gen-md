import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { isInvalidExportAssignment } from "./isInvalidExportAssignment";

describe(isInvalidExportAssignment.name, () => {
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
        "returns false for every other case",
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
        expect(isInvalidExportAssignment(s)).toBe(output);
    };
}
