import { tagUnindent } from "../../../es-utils/index";
import { getDelegationExportStatementsOf } from "./getDelegationExportStatementsOf";
import * as path from "path";
import * as fs from "fs";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

const code = tagUnindent`
    export * from "./some/where"; // 0
    export * as x from "./some/where"; // 1
    export default foo; // 2
    export {a as default,B,c as C}; // 3
    export {a as A,B default as C} from "./some/where"; // 4
    export * from "./some/other/place"; // 5
`;
const absolutePathToMockFile = path.resolve(__dirname, "file.mock.d.ts");
fs.writeFileSync(absolutePathToMockFile, code);
setTimeout(() => fs.unlinkSync(absolutePathToMockFile), 0);

describe(getDelegationExportStatementsOf.name, () => {
    it("returns an array with all the delegation export statements of the d.ts file that corresponds to the provided absolute path", () => {
        const statements = getStatementsOf(absolutePathToMockFile);
        const toEqual = [statements[0], statements[5]];
        const expected = getDelegationExportStatementsOf(absolutePathToMockFile);
        expect(expected).toEqual(toEqual);
    });
});
