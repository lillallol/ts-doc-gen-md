import { tagUnindent } from "../es-utils";
import { DocumentationNode, DocumentationReferenceNode } from "../ts-doc-gen";
import { printDocumentationNode } from "./printDocumentationNode";
import { printDocumentationReferenceNode } from "./printDocumentationReferenceNode";

export function printNodeDocumentationOrReference(node: DocumentationNode | DocumentationReferenceNode): string {
    if (node instanceof DocumentationNode) return printDocumentationNode(node);
    if (node instanceof DocumentationReferenceNode) return printDocumentationReferenceNode(node);
    throw Error(tagUnindent`
        Provided value is not instance of DocumentationNode or DocumentationReferenceNode, as it
        is supposed to be.
    `);
}
