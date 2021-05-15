import { tagUnindent } from "../es-utils/index";
import { printNodeObject } from "../ts-ast-utils/index";
import { ExportChainNode } from "../ts-ast-resolve/exportChainNode/ExportChainNode";

export function printExportChainNode(exportChainNode: ExportChainNode): string {
    const {
        exportedName,
        pathToTsFile,
        namespace,
        importedName,
        exposedName,
        statement,
        shouldDecompose,
    } = exportChainNode;
    return tagUnindent`
                    BRANCH
        statement : 
            ${[printNodeObject(statement, pathToTsFile)]}
        pathToTsFile : 
            ${pathToTsFile}
        exposedName : ${exposedName ?? "undefined"}
        namespace : ${namespace.join("")}
        exportedName : ${exportedName ?? "undefined"}
        importedName : ${importedName ?? "undefined"}
        shouldDecompose : ${shouldDecompose ? "true" : "false"}
    `;
}
