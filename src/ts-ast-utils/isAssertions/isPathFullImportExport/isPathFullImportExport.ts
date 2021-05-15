import * as ts from "../../adapters/typescript";

import { pathFullImportExport } from "../../types";
import { isDelegationExport } from "../isDelegationExport/isDelegationExport";
import { isNamespaceExport } from "../isNamespaceExport/isNamespaceExport";
import { isNamedExportPathFull } from "../isNamedExportPathFull/isNamedExportPathFull";
import { isImportStatement } from "../isImportStatement/isImportStatement";

export function isPathFullImportExport(statement: ts.Statement): statement is pathFullImportExport {
    return (
        isDelegationExport(statement) ||
        isNamespaceExport(statement) ||
        isNamedExportPathFull(statement) ||
        isImportStatement(statement)
    );
}
