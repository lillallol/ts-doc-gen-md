import { getStatementsOf } from "../getStatementsOf/getStatementsOf";
import * as ts from "../../adapters/typescript";
import { isImportStatement } from "../../isAssertions/isImportStatement/isImportStatement";
import { importStatement } from "../../types";

export function getImportStatementOfNameOf(
    absolutePathToTsFile: string,
    nameToSearchFor: string
):
    | {
          resolutionIndex: number;
          isNamespace: boolean;
          isDefault : boolean;
          statement: importStatement;
          propertyName: string;
          name: string;
      }
    | undefined {
    const statements = getStatementsOf(absolutePathToTsFile);
    for (const s of statements) {
        if (!isImportStatement(s)) continue;

        const defaultImportIdentifier = s.importClause?.name;
        const namedBindings = s.importClause?.namedBindings;

        //nameToSearch is in defaultImport
        if (
            defaultImportIdentifier !== undefined &&
            ts.isIdentifier(defaultImportIdentifier) &&
            ts.unescapeLeadingUnderscores(defaultImportIdentifier.escapedText) === nameToSearchFor
        ) {
            return {
                resolutionIndex: 0,
                isNamespace: false,
                statement: s,
                propertyName: nameToSearchFor,
                name: nameToSearchFor,
                isDefault : true
            };
        }

        //nameToSearch is the namespaceImport
        if (
            namedBindings !== undefined &&
            ts.isNamespaceImport(namedBindings) &&
            ts.unescapeLeadingUnderscores(namedBindings.name.escapedText) === nameToSearchFor
        ) {
            return {
                isNamespace: true,
                name: nameToSearchFor,
                propertyName: nameToSearchFor,
                resolutionIndex:
                    defaultImportIdentifier !== undefined && ts.isIdentifier(defaultImportIdentifier) ? 1 : 0,
                statement: s,
                isDefault : false
            };
        }

        //nameToSearch is the namedExport
        if (namedBindings !== undefined && ts.isNamedImports(namedBindings)) {
            const { elements } = namedBindings;
            let resolutionIndex =
                defaultImportIdentifier !== undefined && ts.isIdentifier(defaultImportIdentifier) ? 0 : -1;
            for (const element of elements) {
                resolutionIndex++;
                if (ts.unescapeLeadingUnderscores(element.name.escapedText) === nameToSearchFor) {
                    let propertyName: string;
                    const _propertyName = element.propertyName;
                    if (_propertyName === undefined) propertyName = nameToSearchFor;
                    else propertyName = ts.unescapeLeadingUnderscores(_propertyName.escapedText);
                    return {
                        isNamespace: false,
                        name: nameToSearchFor,
                        propertyName,
                        resolutionIndex,
                        statement: s,
                        isDefault : false
                    };
                }
            }
        }
    }
    return undefined;
}
