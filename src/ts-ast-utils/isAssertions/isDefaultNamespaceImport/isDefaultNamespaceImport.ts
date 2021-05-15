import * as ts from "../../adapters/typescript";
import { defaultNamespaceImport } from "../../types";
import { isImportStatement } from "../isImportStatement/isImportStatement";

export function isDefaultNamespaceImport(s: ts.Statement): s is defaultNamespaceImport {
    if (!isImportStatement(s)) return false;
    const { name, namedBindings } = s.importClause;
    if (namedBindings === undefined) return false;
    if (name === undefined) return false;
    if (ts.isIdentifier(name) && ts.isNamespaceImport(namedBindings)) return true;
    return false;
}