import * as ts from "../../adapters/typescript";
import { exportStatementNonChain } from "../../types";
import { getNameFromFunctionDeclaration } from "./getNameFromFunctionDeclaration";
import { getNameFromInterfaceDeclaration } from "./getNameFromInterfaceDeclaration";
import { getNamesFromVariableStatement } from "./getNamesFromVariableStatement";
import { getNameFromTypeAliasDeclaration } from "./getNameFromTypeAliasDeclaration";
import { getNameFromClassDeclaration } from "./getNameFromClassDeclaration";
import { isDefaultExportNonChain } from "../../isAssertions/isDefaultExportNonChain/isDefaultExportNonChain";
import { getNameFromEnumDeclaration } from "./getNameFromEnumDeclaration";

/**
 * @description
 * This function is not redundant because it does not return `undefined` like `getNamesFromExportStatement`;
 */
export function getNamesFromNonChainExport(s: exportStatementNonChain): string[] {
    if (isDefaultExportNonChain(s)) return ["default"];
    if (ts.isFunctionDeclaration(s)) return [getNameFromFunctionDeclaration(s)];
    if (ts.isClassDeclaration(s)) return [getNameFromClassDeclaration(s)];
    if (ts.isInterfaceDeclaration(s)) return [getNameFromInterfaceDeclaration(s)];
    if (ts.isVariableStatement(s)) return getNamesFromVariableStatement(s);
    if (ts.isTypeAliasDeclaration(s)) return [getNameFromTypeAliasDeclaration(s)];
    if (ts.isEnumDeclaration(s)) return [getNameFromEnumDeclaration(s)];
    throw Error(); //@TODO
}
