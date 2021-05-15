import { printNodeObject } from "../printNodeObject/printNodeObject";
import { tagUnindent } from "../../es-utils/index";
import { defaultExportNonChain } from "../types";

export function defaultExportLiteralNotSupported(statement: defaultExportNonChain, pathToTsFile: string): string {
    return tagUnindent`
        Documentation of default exports of literals is not yet supported,
        because type inference is not yet supported.
        Default export of literal located :

            ${printNodeObject(statement, pathToTsFile)}

        at file :

            ${pathToTsFile}
        
    `;
}
