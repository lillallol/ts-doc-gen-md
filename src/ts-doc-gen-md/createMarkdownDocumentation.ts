import { tagUnindent } from "../es-utils";
import { DocumentationNode } from "../ts-doc-gen/documentExportChainLeaf/DocumentationNode";
import { documentationNodeToMarkdownId } from "./documentationNodeToMarkdownId";
import { printHyperLinkedIdentifiersRecursively } from "./printHyperLinkedIdentifiersRecursively";

export function createMarkdownDocumentation(_: {
    heading: number;
    documentationNodes: DocumentationNode[];
    prefixHref: string;
}): string {
    const { documentationNodes, heading, prefixHref } = _;

    return documentationNodes
        .map((documentationNode) => {
            const { exposedName, namespace } = documentationNode;
            const markdownIdOfStatement = [...namespace, exposedName].join(".");

            const docId = documentationNodeToMarkdownId({ documentationNode, prefixHref });
            // prettier-ignore
            return tagUnindent`
                <h${heading+1} id="${docId}">
                    ${markdownIdOfStatement}
                </h${heading+1}>
            
                \`\`\`ts
                ${[documentationNode.docText]}
                \`\`\`
                ${[printHyperLinkedIdentifiersRecursively({ documentationNode,parentId : docId,prefixHref})]}
                <hr>
            `;
        })
        .join("\n\n");
}