import * as ts from "../adapters/typescript";

export function isAbstraction(statement: ts.Statement): statement is ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
    return ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement);
}
