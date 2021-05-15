import { delegationExportStatement } from "../../types";
import * as ts from "../../adapters/typescript";

export function isDelegationExport(s: ts.Statement): s is delegationExportStatement {
    if (!ts.isExportDeclaration(s))return false;
    const { exportClause, moduleSpecifier } = s;
    if (moduleSpecifier === undefined) return false;
    if (!ts.isStringLiteral(moduleSpecifier)) return false;
    if (exportClause === undefined) return true;
    if (ts.isNamedExports(exportClause)) return false;
    if (ts.isNamespaceExport(exportClause)) return false;
    throw Error(); //@TODO
}
