import * as ts from "../../adapters/typescript";
import { namedExport } from "../../types";
import { isNamedExportPathFull } from "../isNamedExportPathFull/isNamedExportPathFull";
import { isNamedExportPathless } from "../isNamedExportPathless/isNamedExportPathless";

export function isNamedExport(s: ts.Statement): s is namedExport {
    return isNamedExportPathless(s) || isNamedExportPathFull(s);
}
