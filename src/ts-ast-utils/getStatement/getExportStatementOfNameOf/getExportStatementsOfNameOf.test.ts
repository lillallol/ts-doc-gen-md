import * as path from "path";
import * as fs from "fs";
import * as ts from "../../adapters/typescript";

import { getExportStatementsOfNameOf } from "./getExportStatementsOfNameOf";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";
import { printNodeObject } from "../../printNodeObject/printNodeObject";
import { tagUnindent } from "../../../es-utils/index";

//@TODO I have to make that a proper .d.ts file
const code = tagUnindent`
    export { A, b as B, default } from "./some/where";
    export function foo() {}

    "hello world";

    export const a = 1,
        b = 2;

    export type obj = {
        a : number,
        b : string
    };

    export * as x from "./some/where";

    export class AA {
        constructor() {
            //
        }
    }

    export * from "./some/where";

    export const obj = {
        a : 1,
        b : "2"
    }
`;
const absolutePathToMockFile = path.resolve(__dirname, "file.mock.d.ts");
fs.writeFileSync(absolutePathToMockFile, code);
setTimeout(() => fs.unlinkSync(absolutePathToMockFile), 0);

describe(getExportStatementsOfNameOf.name, () => {
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "default",
            res: [{ resolutionIndex: 2, statementIndex: 0 }],
        })
    );
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "foo",
            res: [{ resolutionIndex: 0, statementIndex: 1 }],
        })
    );
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "b",
            res: [{ resolutionIndex: 1, statementIndex: 3 }],
        })
    );
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "obj",
            res: [
                { resolutionIndex: 0, statementIndex: 4 },
                { resolutionIndex: 0, statementIndex: 8 },
            ],
        })
    );
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "x",
            res: [{ resolutionIndex: 0, statementIndex: 5 }],
        })
    );
    it(
        "TODO",
        unitTest({
            nameToSearchFor: "AA",
            res: [{ resolutionIndex: 0, statementIndex: 6 }],
        })
    );
    // "returns the export statement of the provided name of the ts file of the provided absolute path",
});

function unitTest(_: {
    nameToSearchFor: string;
    res: { resolutionIndex: number; statementIndex: number }[];
}): () => void {
    const { nameToSearchFor, res } = _;
    return () => {
        const _printNode = (u: ts.astNode) => printNodeObject(u, absolutePathToMockFile);
        const resolvedExportStatements = getExportStatementsOfNameOf(absolutePathToMockFile, nameToSearchFor);

        const toEqual = res.map(({ statementIndex, resolutionIndex }) => ({
            printedExportStatement: _printNode(getStatementsOf(absolutePathToMockFile)[statementIndex]),
            resolutionIndex,
        }));

        const expected = resolvedExportStatements.map(({ exportStatement, resolutionIndex }) => ({
            printedExportStatement: _printNode(exportStatement),
            resolutionIndex,
        }));

        expect(expected).toEqual(toEqual);
    };
}
