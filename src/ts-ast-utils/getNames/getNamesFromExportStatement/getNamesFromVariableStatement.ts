import * as ts from "../../adapters/typescript";
import { tagUnindent } from "../../../es-utils/index";
import { internalErrorMessages } from "../../../errorMessages";

export function getNamesFromVariableStatement(s: ts.VariableStatement): string[] {
    return s.declarationList.declarations.map((declaration) => {
        const { name } = declaration;
        if (ts.isObjectBindingPattern(name))
            throw Error(internalErrorMessages.internalLibraryErrorSpecific(templateErrorMessage("const {A,B} = obj")));
        if (ts.isArrayBindingPattern(name))
            throw Error(internalErrorMessages.internalLibraryErrorSpecific(templateErrorMessage("const [A,B] = arr")));
        return ts.unescapeLeadingUnderscores(name.escapedText);
    });
}

const templateErrorMessage = (s: "const {A,B} = obj" | "const [A,B] = arr") => tagUnindent`
    Encountered somewhere a destructured assignment. 
    
    Here is an example of what a destructured export is:

        ${s}

    Try again without destructuring, because it is not supported.
`;
