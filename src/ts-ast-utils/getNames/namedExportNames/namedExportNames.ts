import { namedExport } from "../../types";
import * as ts from "../../adapters/typescript";

export function namedExportNames(
    namedExportStatement: namedExport
): { propertyName: string | undefined; name: string }[] {
    return namedExportStatement.exportClause.elements.map(({ propertyName, name }) => {
        return {
            propertyName: propertyName === undefined ? propertyName : ts.unescapeLeadingUnderscores(propertyName.escapedText),
            name: ts.unescapeLeadingUnderscores(name.escapedText),
        };
    });
}
