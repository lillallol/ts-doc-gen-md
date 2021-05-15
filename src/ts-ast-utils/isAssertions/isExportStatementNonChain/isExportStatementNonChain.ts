import { exportStatementNonChain } from "../../types";
import { isDefaultExportNonChain } from "../isDefaultExportNonChain/isDefaultExportNonChain";
import * as ts from "../../adapters/typescript";

export function isExportStatementNonChain(s: ts.Statement): s is exportStatementNonChain {
    // prettier-ignore
    return (
        ts.isTypeAliasDeclaration(s) ||
        ts.isInterfaceDeclaration(s) ||
        ts.isClassDeclaration(s) ||
        ts.isFunctionDeclaration(s) ||
        ts.isVariableStatement(s) ||
        ts.isEnumDeclaration(s) ||
        isDefaultExportNonChain(s)
    );
}
