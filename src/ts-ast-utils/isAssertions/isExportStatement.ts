import * as ts from "../adapters/typescript";
import { exportStatement } from "../types";
import { isExportStatementChain } from "./isExportStatementChain";
import { isExportStatementNonChain } from "./isExportStatementNonChain/isExportStatementNonChain";

export function isExportStatement(s: ts.Statement): s is exportStatement {
    return isExportStatementNonChain(s) || isExportStatementChain(s);
}
