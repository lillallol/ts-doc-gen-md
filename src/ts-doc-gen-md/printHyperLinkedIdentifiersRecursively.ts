import { tagUnindent } from "../es-utils";
import { DocumentationNode } from "../ts-doc-gen/documentExportChainLeaf/DocumentationNode";
import { DocumentationReferenceNode } from "../ts-doc-gen/documentExportChainLeaf/DocumentationReferenceNode";
import { documentationNodeToMarkdownId } from "./documentationNodeToMarkdownId";

//@TODO DRY printing hyperlinked identifiers
export function printHyperLinkedIdentifiersRecursively(_: {
    documentationNode: DocumentationNode;
    parentId: string;
    prefixHref: string;
}): string {
    const { documentationNode, parentId, prefixHref } = _;
    /**
     * @description
     * It returns the markdown id of provided documentation reference node.
     * Only those documentation reference nodes that have already been printed have a markdown id.
     */
    const printedDocumentationReferenceNodeMarkdownId: Map<DocumentationReferenceNode, string> = new Map();
    const isAlreadyPrintedDocumentationReferenceNode: (
        DocumentationReferenceNode: DocumentationReferenceNode
    ) => boolean = (DocumentationReferenceNode) => {
        return typeof printedDocumentationReferenceNodeMarkdownId.get(DocumentationReferenceNode) === "string";
    };

    if (Object.entries(documentationNode.referencedTypes).length === 0) return "";
    const referencesId = `${parentId}-references`;

    const toReturn = tagUnindent`

        <details open="">
        <summary id="${referencesId}">
            <a href="#${referencesId}">#</a>
            references
        </summary>
        
        <br>
        ${[
            Object.keys(documentationNode.referencedTypes)
                .map((referencedDocNodeName) => {
                    const _referencedDocNode:
                        | DocumentationNode
                        | DocumentationReferenceNode = documentationNode.referencedTypeNameToDocumentation(
                        referencedDocNodeName
                    );
                    // is referenced type a documentation node?
                    if (_referencedDocNode instanceof DocumentationNode) {
                        // the p tag is added just to have the same margin as detail tags
                        return tagUnindent`
                        <p>
                            <a href="#${documentationNodeToMarkdownId({
                                documentationNode: _referencedDocNode,
                                prefixHref,
                            })}">
                                <b>${referencedDocNodeName}</b>
                            </a>
                        </p>
                    `;
                    }
                    // has referenced type been already documented
                    const documentationReferenceNodeId = printedDocumentationReferenceNodeMarkdownId.get(
                        _referencedDocNode
                    );
                    if (isAlreadyPrintedDocumentationReferenceNode(_referencedDocNode)) {
                        if (documentationReferenceNodeId === undefined) throw Error(); //@TODO internal library error
                        //#${documentationNodeToMarkdownId(documentationNode)}
                        return tagUnindent`
                        <p>
                            <a href="#${documentationReferenceNodeId}">
                                <b>${referencedDocNodeName}</b>
                            </a>
                        </p>
                    `;
                    }
                    return "";
                })
                .join("\n"),
        ]}
        ${[
            (function recurse(docNode: DocumentationNode | DocumentationReferenceNode, parentId: string): string {
                // return an empty string if there are no referenced types
                if (Object.entries(docNode.referencedTypes).length === 0) return "";
                // prettier-ignore
                return tagUnindent`
                    <blockquote>
                    ${[
                        Object.keys(docNode.referencedTypes)
                            .map((referencedTypeIdentifierName) => {
                                const referencedDocNode : DocumentationNode | DocumentationReferenceNode = docNode.referencedTypeNameToDocumentation(referencedTypeIdentifierName);
                                // is referenced type a documentation node?
                                if (referencedDocNode instanceof DocumentationNode) return "";
                                
                                let documentationReferenceNodeId = printedDocumentationReferenceNodeMarkdownId.get(referencedDocNode);
                                // has referenced type been already documented
                                if (isAlreadyPrintedDocumentationReferenceNode(referencedDocNode)) {
                                    return "";
                                } else {
                                    documentationReferenceNodeId = `${parentId}-${referencedTypeIdentifierName}`;
                                    printedDocumentationReferenceNodeMarkdownId.set(referencedDocNode,documentationReferenceNodeId);
                                }
                                
                                return tagUnindent`
                                    <details>
                                    <summary id="${parentId}-${referencedTypeIdentifierName}">
                                        <a href="#${parentId}-${referencedTypeIdentifierName}">#</a>
                                        <b>${referencedTypeIdentifierName}</b>
                                    </summary>
                                            
                                    \`\`\`ts
                                    ${[referencedDocNode.docText]}
                                    \`\`\`

                                    ${[Object.keys(referencedDocNode.referencedTypes).map(referencedDocNodeName => {
                                        const _referencedDocNode : DocumentationNode | DocumentationReferenceNode = referencedDocNode.referencedTypeNameToDocumentation(referencedDocNodeName);
                                        // is referenced type a documentation node?
                                        if (_referencedDocNode instanceof DocumentationNode) {
                                            // the p tag is added just to have the same margin as detail tags
                                            return tagUnindent`
                                                <p>
                                                    <a href="#${documentationNodeToMarkdownId({documentationNode: _referencedDocNode,prefixHref})}">
                                                        <b>${referencedDocNodeName}</b>
                                                    </a>
                                                </p>
                                            `;
                                        }
                                        // has referenced type been already documented
                                        const documentationReferenceNodeId = printedDocumentationReferenceNodeMarkdownId.get(_referencedDocNode);
                                        if (isAlreadyPrintedDocumentationReferenceNode(_referencedDocNode)) {
                                            if (documentationReferenceNodeId === undefined) throw Error();//@TODO internal library error
                                            //#${documentationNodeToMarkdownId(documentationNode)}
                                            return tagUnindent`
                                                <p>
                                                    <a href="#${documentationReferenceNodeId}">
                                                        <b>${referencedDocNodeName}</b>
                                                    </a>
                                                </p>
                                            `;
                                        }
                                        return "";
                                    }).join("\n")]}

                                    </details>
                                    ${[recurse(referencedDocNode, documentationReferenceNodeId)]}
                                `;
                            })
                            .join("")
                    ]}
                    </blockquote>
                `;
            })(documentationNode, referencesId),
        ]}
        </details>
    `;

    return toReturn;
}