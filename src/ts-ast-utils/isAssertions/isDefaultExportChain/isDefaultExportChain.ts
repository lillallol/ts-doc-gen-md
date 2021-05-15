import { defaultExportChain } from "../../types";
import * as ts from "../../adapters/typescript";

export function isDefaultExportChain(s: ts.Statement): s is defaultExportChain {
    if (!ts.isExportAssignment(s)) return false;
    const { expression } = s;
    return ts.isIdentifier(expression);
}
