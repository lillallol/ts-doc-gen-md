import * as ts from "../../adapters/typescript";
import { namedExportPathless } from "../../types";

export function isNamedExportPathless(s: ts.Statement): s is namedExportPathless {
    if (!ts.isExportDeclaration(s)) return false;
    const { exportClause, moduleSpecifier } = s;
    return exportClause !== undefined && ts.isNamedExports(exportClause) && moduleSpecifier === undefined;
}
