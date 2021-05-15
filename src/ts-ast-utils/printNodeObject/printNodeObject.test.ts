import { printNodeObject } from "./printNodeObject";
import * as path from "path";
import { getStatementsOf } from "../getStatement/getStatementsOf/getStatementsOf";
import { tagUnindent } from "../../es-utils/index";

describe(printNodeObject.name, () => {
    it("returns the text of the source code that corresponds to the provided node object", () => {
        const absolutePathToTsFile = path.resolve(__dirname, "file.mock.ts");
        const statement = getStatementsOf(absolutePathToTsFile)[0];
        console.log(tagUnindent`
            export function foo():number {
                return 1;
            }
        `);
        expect(printNodeObject(statement, absolutePathToTsFile)).toBe(tagUnindent`
            export function foo():number {
                return 1;
            }
        `);
    });
});
