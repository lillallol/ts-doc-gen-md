import { ExportChainLeaf } from "../ts-ast-resolve/exportChainNode/ExportChainLeaf";
import { ExportChainNode } from "../ts-ast-resolve/exportChainNode/ExportChainNode";
import { printExportChainLeaf } from "./printExportChainLeaf";
import { printExportChainNode } from "./printExportChainNode";

export function printExportNode(exportNode: ExportChainNode | ExportChainLeaf): string {
    if (exportNode instanceof ExportChainNode) return printExportChainNode(exportNode);
    else return printExportChainLeaf(exportNode);
}