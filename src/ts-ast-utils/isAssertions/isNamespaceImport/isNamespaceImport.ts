import * as ts from "../../adapters/typescript";
import { namespaceImport } from "../../types";
import { isImportStatement } from "../isImportStatement/isImportStatement";

export function isNamespaceImport(s: ts.Statement): s is namespaceImport {
    if (!isImportStatement(s)) return false;
    const { name, namedBindings } = s.importClause;
    if (namedBindings === undefined) return false;
    if (name !== undefined) return false;
    if (ts.isNamespaceImport(namedBindings)) return true;
    return false;
}