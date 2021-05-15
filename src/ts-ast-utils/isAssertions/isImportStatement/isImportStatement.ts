import * as ts from "../../adapters/typescript";
import { importStatement } from "../../types";

export function isImportStatement(s: ts.Statement): s is importStatement {
    if (!ts.isImportDeclaration(s)) return false;
    const { moduleSpecifier,importClause } = s;
    if (importClause === undefined) return false;
    if (!ts.isStringLiteral(moduleSpecifier)) {
        throw Error(
            "case of import statement with non string literal for module specifier has not been taken into consideration. Is this is valid case anyway?"
        );
    }
    return true;
}
