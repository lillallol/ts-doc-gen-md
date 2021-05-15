import * as ts from "../../adapters/typescript";
import { namedExportPathFull } from "../../types";

export function isNamedExportPathFull(s: ts.Statement): s is namedExportPathFull {
    if (!ts.isExportDeclaration(s)) return false;
    const { exportClause, moduleSpecifier } = s;
    if (moduleSpecifier === undefined) return false;
    if (!ts.isStringLiteral(moduleSpecifier)) return false;
    if (exportClause === undefined) return false;
    if (ts.isNamedExports(exportClause)) return true;
    if (ts.isNamespaceExport(exportClause)) return false;
    throw Error(); //@TODO
}