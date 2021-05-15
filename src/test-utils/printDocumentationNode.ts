import { tagUnindent } from "../es-utils";
import { printNodeObject } from "../ts-ast-utils";
import { DocumentationNode } from "../ts-doc-gen";

export function printDocumentationNode(documentationNode: DocumentationNode): string {
    const {
        pathToTsFile: absolutePathToTsFileContainingStatement,
        exposedName,
        namespace,
        docText,
        referencedTypes,
        resolutionIndex,
        statement,
    } = documentationNode;
    return tagUnindent`
        ========= documentation node ========

        statement : 

            ${[printNodeObject(statement, absolutePathToTsFileContainingStatement)]}

        resolutionIndex : ${resolutionIndex}
        path : ${absolutePathToTsFileContainingStatement}
        exposed name : ${exposedName ?? "null"}
        namespace : ${[namespace.join(".")]}

        docText : 

            ${[docText]}

        referencedTypes :

            ${[Object.keys(referencedTypes).join(",")]}
    `;
}
