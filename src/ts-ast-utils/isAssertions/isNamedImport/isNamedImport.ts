import * as ts from "../../adapters/typescript";
import { isImportStatement } from "../isImportStatement/isImportStatement";
import { namedImport } from "../../types";

export function isNamedImport(s: ts.Statement): s is namedImport {
    if (!isImportStatement(s)) return false;
    const { name, namedBindings } = s.importClause;
    if (namedBindings === undefined) return false;
    if (name !== undefined) return false;
    if (ts.isNamedImports(namedBindings)) return true;
    return false;
}
