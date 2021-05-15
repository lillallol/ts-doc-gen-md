import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { hasJSDocTagOfName } from "./hasJSDocTagOfName";

describe(hasJSDocTagOfName.name, () => {
    it("returns true when the provided statement has the provided JSDoc tag name in its last JSDoc comment", () => {
        const s = createMockSourceFile(`
            /**
             * @public
            */
            /**
             * @private
            */
            const a = 1;
        `).statements[0];
        expect(hasJSDocTagOfName(s, "private")).toBe(true);
    });
    it("returns false when the provided statement does not have the provided tag name in its last JSDoc comment", () => {
        const s = createMockSourceFile(`
            /**
             * @private
            */
            /**
             * @public
            */
            const a = 1;
        `).statements[0];
        expect(hasJSDocTagOfName(s, "private")).toBe(false);
    });
    it("returns false when the provided statement does not have JSDoc comment", () => {
        const s = createMockSourceFile(`
            const a = 1;
        `).statements[0];
        expect(hasJSDocTagOfName(s, "private")).toBe(false);
    });
});
