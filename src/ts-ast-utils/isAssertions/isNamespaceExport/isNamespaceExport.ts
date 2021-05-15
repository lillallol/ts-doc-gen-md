import * as ts from "../../adapters/typescript";
import { namespaceExportStatement } from "../../types";

export function isNamespaceExport(s: ts.Statement): s is namespaceExportStatement {
    if (!ts.isExportDeclaration(s)) return false;
    const { exportClause, moduleSpecifier } = s;
    if (moduleSpecifier === undefined) return false;
    if (!ts.isStringLiteral(moduleSpecifier)) throw Error(); //@TODO
    if (exportClause === undefined) return false;
    if (ts.isNamedExports(exportClause)) return false;
    if (ts.isNamespaceExport(exportClause)) return true;
    throw Error(); //@TODO
}
