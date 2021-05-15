import { tagUnindent } from "./es-utils";

import { issuesUrl } from "./constants";
import { printNodeObject, ts } from "./ts-ast-utils";
import { exportChainLeafStatement } from "./ts-ast-resolve";
import { firstLines } from "./constants";

export const errorMessages = {
    badOutputPath: (absolutePathToOutput: string): string => tagUnindent`
        Bad output path:

            ${absolutePathToOutput}

        Is there a file there already?
    `,
    badHeading: (headingNumber: number): string => tagUnindent`
        Heading got value:

            ${headingNumber}

        but it has to take value between 1 and 6.
    `,
    badInputType: "Received input is not of type string as it has to be.",
    badOutputType: "Received output is not type undefined or string, as it has to be.",
    badSortType: "Received sort is not of type boolean as it has to be.",
    badPrefixHrefType: "Received prefixHref is not of type string as it has to be.",
    badHeadingStartingNumberType: "Received headingStartingNumber is not of type number as it has to be.",
    badFormatType: "Received format is not of type function as it has to be.",
    projectContainsStatementThatCanBeDocumented: (path: string): string => tagUnindent`
        File in path:
    
            ${path}
    
        contains invalid statement. Are there any typescript namespaces or non ES import/exports?
    `,
};

export const internalErrorMessages = {
    internalLibraryError: tagUnindent`
        Something went wrong. If you have not used the library in a way
        it is not supposed to be used, then copy this error message and
        open an issue here:

            ${issuesUrl}
    `,
    internalLibraryErrorSpecific(specificErrorMessage: string): string {
        return tagUnindent`
            ${[internalErrorMessages.internalLibraryError]}

            specific error message :

            ${[specificErrorMessage]}
        `;
    },
    //@TODO sometimes the astNodes is an empty array. Do not print astNodes section then
    internalLibraryErrorForToDocText: (_: {
        specificErrorMessage: string;
        pathToTsFile: string;
        astNodes: ts.astNode[];
        initialStatement: exportChainLeafStatement;
    }): string => {
        return internalErrorMessages.internalLibraryErrorSpecific(tagUnindent`
                ${[_.specificErrorMessage]}

                ast node :

                    ${[_.astNodes.map((astNode) => firstLines(printNodeObject(astNode, _.pathToTsFile))).join("\n\n")]}

                initial statement :

                    ${[firstLines(printNodeObject(_.initialStatement, _.pathToTsFile))]}

                absolute path to file containing ast node and initial statement :

                    ${_.pathToTsFile}

            `);
    },
};
