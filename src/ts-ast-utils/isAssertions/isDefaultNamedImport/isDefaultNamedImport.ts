import * as ts from "../../adapters/typescript";
import { defaultNamedImport } from "../../types";
import { isImportStatement } from "../isImportStatement/isImportStatement";

export function isDefaultNamedImport(s: ts.Statement): s is defaultNamedImport {
    if (!isImportStatement(s)) return false;
    const { name, namedBindings } = s.importClause;
    if (namedBindings === undefined) return false;
    if (name === undefined) return false;
    if (ts.isIdentifier(name) && ts.isNamedImports(namedBindings)) return true;
    return false;
}