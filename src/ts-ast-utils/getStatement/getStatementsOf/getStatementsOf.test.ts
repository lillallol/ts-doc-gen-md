import { tagUnindent } from "../../../es-utils/index";
import { getStatementsOf } from "./getStatementsOf";
import * as fs from "fs";
import * as path from "path";
import { printNodeObject } from "../../printNodeObject/printNodeObject";

describe(getStatementsOf.name, () => {
    it("returns the statements of the file that corresponds to the provided absolute path", () => {
        const code = tagUnindent`
            "hello";
            "world";
        `;
        const absolutePathToMockFile = path.resolve(__dirname, "file.mock.d.ts");
        fs.writeFileSync(absolutePathToMockFile, code);
        setTimeout(() => fs.unlinkSync(absolutePathToMockFile), 0);
        const expected = getStatementsOf(absolutePathToMockFile).map((s) => printNodeObject(s, absolutePathToMockFile).trim());
        expect(expected).toEqual([`"hello";`, `"world";`]);
    });
});
