import { namedExportNames } from "./namedExportNames";
import { isNamedExportPathFull } from "../../isAssertions/isNamedExportPathFull/isNamedExportPathFull";
import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { isNamedExportPathless } from "../../isAssertions/isNamedExportPathless/isNamedExportPathless";

const code = tagUnindent`
    export {default,default as A, b as B, C} from "some/where";
    export {A as default, b as B, C};
`;

describe(namedExportNames.name, () => {
    it(
        "returns an array of propertyName and name diplets that correspond to the provided named export",
        unitTest({
            toEqual: [
                {
                    propertyName: undefined,
                    name: "default",
                },
                {
                    propertyName: "default",
                    name: "A",
                },
                {
                    propertyName: "b",
                    name: "B",
                },
                {
                    propertyName: undefined,
                    name: "C",
                },
            ],
            statementIndex: 0,
        })
    );
    it(
        "returns an array of propertyName and name diplets that correspond to the provided named export pathless",
        unitTest({
            toEqual: [
                {
                    propertyName: "A",
                    name: "default",
                },
                {
                    propertyName: "b",
                    name: "B",
                },
                {
                    propertyName: undefined,
                    name: "C",
                },
            ],
            statementIndex: 1,
        })
    );
});

function unitTest(_: {
    statementIndex: number;
    toEqual: { propertyName: string | undefined; name: string }[];
}): () => void {
    const { statementIndex, toEqual } = _;
    return () => {
        const statement = createMockSourceFile(code).statements[statementIndex];
        if (isNamedExportPathFull(statement) || isNamedExportPathless(statement))
            expect(namedExportNames(statement)).toEqual(toEqual);
        else throw Error();
    };
}
