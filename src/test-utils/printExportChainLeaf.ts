import { tagUnindent } from "../es-utils/index";
import { printNodeObject } from "../ts-ast-utils/index";
import { ExportChainLeaf } from "../ts-ast-resolve/exportChainNode/ExportChainLeaf";

export function printExportChainLeaf(exportChainLeaf: ExportChainLeaf): string {
    const { pathToTsFile, namespace, resolutionIndex, exposedName, statement } = exportChainLeaf;
    return tagUnindent`
                    LEAF
        statement : 
            ${[printNodeObject(statement, pathToTsFile)]}
        pathToTsFile : 
            ${pathToTsFile}
        exposedName : ${exposedName ?? "undefined"}
        namespace : ${namespace.join("")}
        resolutionIndex : ${resolutionIndex}
    `;
}
