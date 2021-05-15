import * as ts from "../adapters/typescript";
import { exportStatementChain } from "../types";
import { isDefaultExportChain } from "./isDefaultExportChain/isDefaultExportChain";
import { isDelegationExport } from "./isDelegationExport/isDelegationExport";
import { isNamedExportPathFull } from "./isNamedExportPathFull/isNamedExportPathFull";
import { isNamedExportPathless } from "./isNamedExportPathless/isNamedExportPathless";
import { isNamespaceExport } from "./isNamespaceExport/isNamespaceExport";

export function isExportStatementChain(s: ts.Statement): s is exportStatementChain {
    return (
        isNamedExportPathFull(s) ||
        isNamedExportPathless(s) ||
        isDefaultExportChain(s) ||
        isNamespaceExport(s) ||
        isDelegationExport(s)
    );
}
