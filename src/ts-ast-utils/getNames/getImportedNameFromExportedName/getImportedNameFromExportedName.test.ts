import { isNamedExport } from "../../isAssertions/isNamedExport/isNamedExport";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { tagUnindent } from "../../../es-utils/index";
import { getImportedNameFromExportedName } from "./getImportedNameFromExportedName";

const code = tagUnindent`
    export {default,default as A, b as B, C} from "some/where";
    export {A as default, b as B, C};
`;

describe(getImportedNameFromExportedName.name, () => {
    it(
        "returns the imported name given the exported name for the case of path full export with default export import",
        unitTest({
            exportedName: "default",
            statementIndex: 0,
            importedName: "default",
        })
    );
    it(
        "returns the imported name given the exported name for the case of path full export with default import named export",
        unitTest({
            exportedName: "A",
            statementIndex: 0,
            importedName: "default",
        })
    );
    it(
        "returns the imported name given the exported name for the case of path full export with named import named export",
        unitTest({
            exportedName: "B",
            statementIndex: 0,
            importedName: "b",
        })
    );
    it(
        "returns the imported name given the exported name for the case of path full export with named import export",
        unitTest({
            exportedName: "C",
            statementIndex: 0,
            importedName: "C",
        })
    );
    it(
        "returns the imported name given the exported name for the case of pathless export with named import default export",
        unitTest({
            exportedName: "default",
            statementIndex: 1,
            importedName: "A",
        })
    );
    it(
        "returns the imported name given the exported name for the case of pathless export with named import named export",
        unitTest({
            exportedName: "B",
            statementIndex: 1,
            importedName: "b",
        })
    );
    it(
        "returns the imported name given the exported name for the case of pathless export with named import export",
        unitTest({
            exportedName: "C",
            statementIndex: 1,
            importedName: "C",
        })
    );
});

function unitTest(_: { statementIndex: number; exportedName: string; importedName: string }): () => void {
    const { statementIndex, exportedName, importedName } = _;
    return (): void => {
        const s = createMockSourceFile(code).statements[statementIndex];
        if (!isNamedExport(s)) throw Error();
        expect(getImportedNameFromExportedName(s, exportedName)).toBe(importedName);
    };
}
