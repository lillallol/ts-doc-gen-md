import * as ts from "../../adapters/typescript";
import { namespaceExportStatement } from "../../types";

export function getNameFromNamespaceExport(statement: namespaceExportStatement): string {
    return ts.unescapeLeadingUnderscores(statement.exportClause.name.escapedText);
}
