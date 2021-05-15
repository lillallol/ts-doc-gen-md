import * as path from "path";
import * as fs from "fs";

import { isAbstraction, isConcretion } from "../ts-ast-utils/index";
import { tagUnindent } from "../es-utils/index";
import { resolvePublicApiDocumentationNodes, DocumentationNode } from "../ts-doc-gen/index";
import { createMarkdownDocumentation } from "./createMarkdownDocumentation";
import { documentationNodeToMarkdownId } from "./documentationNodeToMarkdownId";
import { errorMessages } from "../errorMessages";

/**
 * @description
 * Generates documentation in markdown, given the typings entry point file of a
 * typescript project.
 * @CLI
 */
export function tsDocGenMd(parameters: {
    /**
     * @description
     * Path to the typings entry point file.
     * @default "./dist/index.d.ts"
     * @flag i
     */
    input?: string;
    /**
     * @description
     * Path to save the generated documentation. If no path is provided then no output file is created.
     * @default undefined
     * @flag o
     */
    output?: string;
    /**
     * @description
     * Display in alphabetic order the documentation.
     * @default false
     */
    sort?: boolean;
    /**
     * @description
     * Prefix for all the hyperlinks of the generated documentation.
     * @default ""
     */
    prefixHref?: string;
    /**
     * @description
     * Number that specifies the starting heading number of the generated documentation.
     * @default 3
     */
    headingStartingNumber?: 2 | 3 | 4 | 5 | 6;
    /**
     * @description
     * Used to format the code.
     * @default (src) => src
     */
    format?: (src: string) => string;
}): string {
    const { output } = parameters;

    let { sort, headingStartingNumber, prefixHref, input, format } = parameters;

    if (input === undefined) input = "./dist/index.d.ts";
    if (sort === undefined) sort = false;
    if (headingStartingNumber === undefined) headingStartingNumber = 3;
    if (prefixHref === undefined) prefixHref = "";
    if (format === undefined) format = (src) => src;

    if (typeof input !== "string") throw Error(errorMessages.badInputType);
    if (output !== undefined && typeof output !== "string") throw Error(errorMessages.badOutputType);
    if (typeof sort !== "boolean") throw Error(errorMessages.badSortType);
    if (typeof prefixHref !== "string") throw Error(errorMessages.badPrefixHrefType);
    if (typeof headingStartingNumber !== "number") throw Error(errorMessages.badHeadingStartingNumberType);
    if (typeof format !== "function") throw Error(errorMessages.badFormatType);

    if (headingStartingNumber < 1 || headingStartingNumber > 6) {
        throw Error(errorMessages.badHeading(headingStartingNumber));
    }

    const absolutePathToInput: string = path.resolve(input);

    const documentationNodes: DocumentationNode[] = resolvePublicApiDocumentationNodes(absolutePathToInput);

    for (const docNode of documentationNodes) {
        docNode.docText = format(docNode.docText);
    }

    if (sort) {
        documentationNodes.sort((node1, node2) =>
            documentationNodeToMarkdownId({ documentationNode: node1, prefixHref: "" }) <=
            documentationNodeToMarkdownId({ documentationNode: node2, prefixHref: "" })
                ? -1
                : 1
        );
    }

    const concretionDocumentationNodes = documentationNodes.filter(({ statement }) => isConcretion(statement));
    const abstractionDocumentationNodes = documentationNodes.filter(({ statement }) => isAbstraction(statement));

    const concretionDocumentation: string = (() => {
        if (concretionDocumentationNodes.length === 0) return "";
        return tagUnindent`
            <h${headingStartingNumber} id="${prefixHref}-concretions">Concretions</h${headingStartingNumber}>
            ${[
                createMarkdownDocumentation({
                    heading: headingStartingNumber,
                    documentationNodes: concretionDocumentationNodes,
                    prefixHref,
                }),
            ]}
        `;
    })();

    const abstractionDocumentation: string = (() => {
        if (abstractionDocumentationNodes.length === 0) return "";
        return tagUnindent`
            <h${headingStartingNumber} id="${prefixHref}-abstractions">Abstractions</h${headingStartingNumber}>
            ${[
                createMarkdownDocumentation({
                    heading: headingStartingNumber,
                    documentationNodes: abstractionDocumentationNodes,
                    prefixHref,
                }),
            ]}
        `;
    })();

    const generatedDocumentation = tagUnindent`
        ${[concretionDocumentation]}
        ${[abstractionDocumentation]}
    `;

    if (output !== undefined) {
        const absolutePathToOutput = path.resolve(output);
        const outputPathCanBeAccessed = (() => {
            try {
                fs.accessSync(absolutePathToOutput);
                return true;
            } catch (e) {
                return false;
            }
        })();
        if (outputPathCanBeAccessed) {
            throw Error(errorMessages.badOutputPath(absolutePathToOutput));
        }
        fs.writeFileSync(absolutePathToOutput, generatedDocumentation);
    }

    return generatedDocumentation;
}

// function printAnchorTags():string {
//     return Object.keys(referencedDocNode.referencedTypes).map(referencedDocNodeName => {
//         const _referencedDocNode : DocumentationNode | DocumentationReferenceNode = referencedDocNode.referencedTypeNameToDocumentation(referencedDocNodeName);
//         // is referenced type a documentation node?
//         if (_referencedDocNode instanceof DocumentationNode) {
//             // the p tag is added just to have the same margin as detail tags
//             return tagUnindent`
//                 <p>
//                     <a href="#${documentationNodeToMarkdownId({documentationNode: _referencedDocNode,prefixHref})}">
//                         <b>${referencedDocNodeName}</b>
//                     </a>
//                 </p>
//             `;
//         }
//         // has referenced type been already documented
//         const documentationReferenceNodeId = printedDocumentationReferenceNodeMarkdownId.get(_referencedDocNode);
//         if (isAlreadyPrintedDocumentationReferenceNode(_referencedDocNode)) {
//             if (documentationReferenceNodeId === undefined) throw Error();//@TODO internal library error
//             //#${documentationNodeToMarkdownId(documentationNode)}
//             return tagUnindent`
//                 <p>
//                     <a href="#${documentationReferenceNodeId}">
//                         <b>${referencedDocNodeName}</b>
//                     </a>
//                 </p>
//             `;
//         }
//         return "";
//     }).join("\n")
// }
