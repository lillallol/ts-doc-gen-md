import { tagUnindent } from "../es-utils/index";
import { ExportChainLeaf } from "../ts-ast-resolve/exportChainNode/ExportChainLeaf";
import { ExportChainNode } from "../ts-ast-resolve/exportChainNode/ExportChainNode";
import { printExportNode } from "./printExportNode";

export function printArrayOfExportNode(arrayOfExportNode : (ExportChainNode | ExportChainLeaf)[]) : string {
    return arrayOfExportNode.map(node => printExportNode(node)).join(tagUnindent`

        -------------------------------------------------------------
    
    `)
}