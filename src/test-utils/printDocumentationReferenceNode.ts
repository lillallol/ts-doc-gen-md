import { tagUnindent } from "../es-utils";
import { printNodeObject } from "../ts-ast-utils";
import { DocumentationReferenceNode } from "../ts-doc-gen";

export function printDocumentationReferenceNode(documentationNode: DocumentationReferenceNode): string {
    const {
        pathToTsFile: absolutePathToTsFileContainingStatement,
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

        docText : 

            ${[docText]}

        referencedTypes :

            ${[Object.keys(referencedTypes).join(",")]}
    `;
}
