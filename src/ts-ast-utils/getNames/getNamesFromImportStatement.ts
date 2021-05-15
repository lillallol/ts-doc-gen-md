import * as ts from "../adapters/typescript";
import { importStatement } from "../types";

export function getNamesFromImportStatement(s: importStatement): returnTypeElement[] {
    const { namedBindings, name } = s.importClause;
    const toReturn: returnTypeElement[] = [];
    if (name !== undefined && ts.isIdentifier(name)) {
        const _ = name.text;
        toReturn.push({
            name: _,
            propertyName: _,
        });
    }
    if (namedBindings !== undefined && ts.isNamespaceImport(namedBindings)) {
        const _ = namedBindings.name.text;
        toReturn.push({
            name: _,
            propertyName: _,
        });
    }
    if (namedBindings !== undefined && ts.isNamedImports(namedBindings)) {
        toReturn.push(
            ...Array.from(namedBindings.elements).map(({ name, propertyName }) => ({
                name: name.text,
                propertyName: propertyName !== undefined ? propertyName.text : name.text,
            }))
        );
    }
    return toReturn;
}

export type returnTypeElement = {
    name: string;
    propertyName: string;
};
