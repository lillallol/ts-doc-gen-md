import { isImportStatement } from "../isAssertions/isImportStatement/isImportStatement";
import { createMockSourceFile } from "../../test-utils/createMockSourceFile";
import { tagUnindent } from "../../es-utils/index";
import { getNamesFromImportStatement } from "./getNamesFromImportStatement";

const code = tagUnindent`
    import foo from "./somewhere"; // 0
    import * as x from "./somewhere"; // 1
    import {default as A,b as B,C} from "./somewhere"; // 2
    import foo, {default as A,b as B,C} from "./somewhere"; // 3
    import foo, * as x from "./somewhere"; // 4
`;

describe(getNamesFromImportStatement.name, () => {
    it(
        "returns the name and property name for a default import",
        unitTest({
            statementIndex: 0,
            toEqual: [
                {
                    name: "foo",
                    propertyName: "foo",
                },
            ],
        })
    );
    it(
        "returns the name and property name for a namespace import",
        unitTest({
            statementIndex: 1,
            toEqual: [
                {
                    name: "x",
                    propertyName: "x",
                },
            ],
        })
    );
    it(
        "returns the names and property names for a named import",
        unitTest({
            statementIndex: 2,
            toEqual: [
                {
                    name: "A",
                    propertyName: "default",
                },
                {
                    name: "B",
                    propertyName: "b",
                },
                {
                    name: "C",
                    propertyName: "C",
                },
            ],
        })
    );
    it(
        "returns the names and property names for a default named import",
        unitTest({
            statementIndex: 3,
            toEqual: [
                {
                    name: "foo",
                    propertyName: "foo",
                },
                {
                    name: "A",
                    propertyName: "default",
                },
                {
                    name: "B",
                    propertyName: "b",
                },
                {
                    name: "C",
                    propertyName: "C",
                },
            ],
        })
    );
    it(
        "returns the names and property names for a default named import",
        unitTest({
            statementIndex: 4,
            toEqual: [
                {
                    name: "foo",
                    propertyName: "foo",
                },
                {
                    name: "x",
                    propertyName: "x",
                },
            ],
        })
    );
});

function unitTest(_: { statementIndex: number; toEqual: { name: string; propertyName: string }[] }): () => void {
    const { statementIndex, toEqual } = _;
    return () => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        if (!isImportStatement(statement)) throw Error();
        expect(getNamesFromImportStatement(statement)).toEqual(toEqual);
    };
}
