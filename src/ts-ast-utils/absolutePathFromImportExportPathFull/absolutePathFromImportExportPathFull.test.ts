import * as path from "path";
import * as fs from "fs";

import { absolutePathFromImportExportPathFull } from "./absolutePathFromImportExportPathFull";
import { getStatementsOf } from "../getStatement/getStatementsOf/getStatementsOf";
import { tagUnindent } from "../../es-utils/index";
import { isPathFullImportExport } from "../isAssertions/isPathFullImportExport/isPathFullImportExport";

const code = tagUnindent`
    export * as x from "./some/where";
    export * from "./some/where";
    export { A, b as B, default as C } from "./some/where";

    import * as x from "./some/where";
    import foo, { A, b as B, default as C } from "./some/where";
`;
const absolutePathToMockFile = path.resolve(__dirname, "./file.mock.d.ts");
const toBe = path.resolve(__dirname, "./some/where.d.ts");
fs.writeFileSync(absolutePathToMockFile, code);
setTimeout(() => fs.unlinkSync(absolutePathToMockFile), 0);

describe(absolutePathFromImportExportPathFull.name, () => {
    it(
        "returns the absolute path from where the namespace export exports",
        unitTest({
            statementIndex: 0,
        })
    );
    it(
        "returns the absolute path from where the delegation export exports",
        unitTest({
            statementIndex: 1,
        })
    );
    it(
        "returns the absolute path from where the named export exports",
        unitTest({
            statementIndex: 2,
        })
    );
    it(
        "returns the absolute path from where the namespace import imports",
        unitTest({
            statementIndex: 3,
        })
    );
    it(
        "returns the absolute path from where the path full named import imports",
        unitTest({
            statementIndex: 4,
        })
    );
});

function unitTest(_: { statementIndex: number }): () => void {
    const { statementIndex } = _;
    return () => {
        const statement = getStatementsOf(absolutePathToMockFile)[statementIndex];
        if (!isPathFullImportExport(statement)) throw Error();
        expect(absolutePathFromImportExportPathFull(absolutePathToMockFile, statement)).toBe(toBe);
    };
}
