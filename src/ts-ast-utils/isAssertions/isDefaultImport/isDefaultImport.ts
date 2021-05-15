import * as ts from "../../adapters/typescript";
import { defaultImport } from "../../types";
import { isImportStatement } from "../isImportStatement/isImportStatement";

export function isDefaultImport(s: ts.Statement): s is defaultImport {
    if (!isImportStatement(s)) return false;
    const { name, namedBindings } = s.importClause;
    if (namedBindings !== undefined) return false;
    if (name === undefined) return false;
    return true;
}