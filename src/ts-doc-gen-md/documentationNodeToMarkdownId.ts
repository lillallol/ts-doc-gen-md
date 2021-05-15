import { isAbstraction } from "../ts-ast-utils";
import { DocumentationNode } from "../ts-doc-gen/documentExportChainLeaf/DocumentationNode";

export function documentationNodeToMarkdownId(_: { documentationNode: DocumentationNode; prefixHref: string }): string {
    const {
        documentationNode: { namespace, exposedName, statement },
        prefixHref,
    } = _;

    return `${prefixHref}-${isAbstraction(statement) ? "abstraction" : "concretion"}-${[...namespace, exposedName].join(
        "."
    )}`;
}