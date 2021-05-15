import { getImportStatementOfNameOf } from "./getImportStatementOfNameOf";
import { tagUnindent } from "../../../es-utils/index";
import { createMockFile } from "../../../test-utils/createMockFile";
import { printNodeObject } from "../../printNodeObject/printNodeObject";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

const absolutePathToMockFile = createMockFile({
    code: tagUnindent`
        import {AA,bb as BB,default as CC} from "./somewhere"; // 0
        import * as x from "./somewhere"; // 1
        import D, {A,b as B,default as C} from "./somewhere"; // 2
        import foo, * as __y from "./somewhere"; // 3
        import bar from "./somewhere"; // 4
    `,
    dirname: __dirname,
});

describe(getImportStatementOfNameOf.name, () => {
    describe("0", () => {
        it(
            "returns the import statement that imports an identifier with the provided name",
            unitTest({
                nameToSearchFor: "AA",
                toEqual: {
                    isNamespace: false,
                    name: "AA",
                    propertyName: "AA",
                    resolutionIndex: 0,
                    statementIndex: 0,
                    isDefault: false,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "BB",
                toEqual: {
                    isNamespace: false,
                    name: "BB",
                    propertyName: "bb",
                    resolutionIndex: 1,
                    statementIndex: 0,
                    isDefault: false,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "CC",
                toEqual: {
                    isNamespace: false,
                    name: "CC",
                    propertyName: "default",
                    resolutionIndex: 2,
                    statementIndex: 0,
                    isDefault: false,
                },
            })
        );
    });
    describe("1", () => {
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "x",
                toEqual: {
                    isNamespace: true,
                    name: "x",
                    propertyName: "x",
                    resolutionIndex: 0,
                    statementIndex: 1,
                    isDefault: false,
                },
            })
        );
    });
    describe("2", () => {
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "D",
                toEqual: {
                    isNamespace: false,
                    name: "D",
                    propertyName: "D",
                    resolutionIndex: 0,
                    statementIndex: 2,
                    isDefault: true,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "A",
                toEqual: {
                    isNamespace: false,
                    name: "A",
                    propertyName: "A",
                    resolutionIndex: 1,
                    statementIndex: 2,
                    isDefault: false,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "B",
                toEqual: {
                    isNamespace: false,
                    name: "B",
                    propertyName: "b",
                    resolutionIndex: 2,
                    statementIndex: 2,
                    isDefault: false,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "C",
                toEqual: {
                    isNamespace: false,
                    name: "C",
                    propertyName: "default",
                    resolutionIndex: 3,
                    statementIndex: 2,
                    isDefault: false,
                },
            })
        );
    });
    describe("3", () => {
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "foo",
                toEqual: {
                    isNamespace: false,
                    name: "foo",
                    propertyName: "foo",
                    resolutionIndex: 0,
                    statementIndex: 3,
                    isDefault: true,
                },
            })
        );
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "__y",
                toEqual: {
                    isNamespace: true,
                    name: "__y",
                    propertyName: "__y",
                    resolutionIndex: 1,
                    statementIndex: 3,
                    isDefault: false,
                },
            })
        );
    });
    describe("4", () => {
        it(
            "TODO",
            unitTest({
                nameToSearchFor: "bar",
                toEqual: {
                    isNamespace: false,
                    name: "bar",
                    propertyName: "bar",
                    resolutionIndex: 0,
                    statementIndex: 4,
                    isDefault: true,
                },
            })
        );
    });
});

function unitTest(_: {
    nameToSearchFor: string;
    toEqual: {
        statementIndex: number;
        resolutionIndex: number;
        isNamespace: boolean;
        propertyName: string;
        name: string;
        isDefault: boolean;
    };
}): () => void {
    const { nameToSearchFor, toEqual } = _;
    return () => {
        const res = getImportStatementOfNameOf(absolutePathToMockFile, nameToSearchFor);
        if (res === undefined) throw Error();
        const { name, propertyName, resolutionIndex, isNamespace, statement, isDefault } = res;
        const expected = {
            name,
            propertyName,
            printedStatement: printNodeObject(statement, absolutePathToMockFile),
            isNamespace,
            resolutionIndex,
            isDefault,
        };
        const _toEqual = {
            name: toEqual.name,
            propertyName: toEqual.propertyName,
            printedStatement: printNodeObject(
                getStatementsOf(absolutePathToMockFile)[toEqual.statementIndex],
                absolutePathToMockFile
            ),
            isNamespace: toEqual.isNamespace,
            resolutionIndex: toEqual.resolutionIndex,
            isDefault: toEqual.isDefault,
        };
        expect(expected).toEqual(_toEqual);
    };
}
