import * as ts from "./adapters/typescript";

//#region non chain exports
export type exportStatementNonChain =
    | ts.FunctionDeclaration
    | ts.ClassDeclaration
    | ts.InterfaceDeclaration
    | ts.VariableStatement
    | ts.TypeAliasDeclaration
    | ts.EnumDeclaration
    | defaultExportNonChain;

export type defaultExportNonChain =
    | ts.FunctionDeclaration
    | ts.ClassDeclaration
    | ts.InterfaceDeclaration
    | exportAssignmentNonChain;

interface exportAssignmentNonChain extends ts.ExportAssignment {
    expression: ts.Expression;
}
//#endregion

//#region chain exports
export interface defaultExportChain extends ts.ExportAssignment {
    expression: ts.Identifier;
}

export interface namedExportPathless extends ts.ExportDeclaration {
    exportClause: ts.NamedExports;
    moduleSpecifier: undefined;
}

export interface namespaceExportStatement extends ts.ExportDeclaration {
    exportClause: ts.NamespaceExport;
    moduleSpecifier: ts.StringLiteral;
}

export interface delegationExportStatement extends ts.ExportDeclaration {
    exportClause: undefined;
    moduleSpecifier: ts.StringLiteral;
}

export interface namedExportPathFull extends ts.ExportDeclaration {
    exportClause: ts.NamedExports;
    moduleSpecifier: ts.StringLiteral;
}
export type namedExport = namedExportPathFull | namedExportPathless;

export type exportStatementChain =
    | defaultExportChain
    | namespaceExportStatement
    | namedExport
    | delegationExportStatement;
//#endregion

export type exportStatement = exportStatementChain | exportStatementNonChain;

export interface importStatement extends ts.ImportDeclaration {
    moduleSpecifier: ts.StringLiteral;
    importClause: ts.ImportClause;
}

export interface defaultImportImportClause extends ts.ImportClause {
    name: ts.Identifier;
    namedBindings: undefined;
}

export interface defaultNamespaceImportImportClause extends ts.ImportClause {
    name: ts.Identifier;
    namedBindings: ts.NamespaceImport;
}

export interface defaultNamedImportImportClause extends ts.ImportClause {
    name: ts.Identifier;
    namedBindings: ts.NamedImports;
}

export interface namespaceImportImportClause extends ts.ImportClause {
    name: undefined;
    namedBindings: ts.NamespaceImport;
}

export interface namedImportImportClause extends ts.ImportClause {
    name: undefined;
    namedBindings: ts.NamedImports;
}

export interface defaultImport extends importStatement {
    importClause: defaultImportImportClause;
}
export interface defaultNamespaceImport extends importStatement {
    importClause: defaultNamespaceImportImportClause;
}
export interface defaultNamedImport extends importStatement {
    importClause: defaultNamedImportImportClause;
}
export interface namespaceImport extends importStatement {
    importClause: namespaceImportImportClause;
}
export interface namedImport extends importStatement {
    importClause: namedImportImportClause;
}

export type pathFullImportExport =
    | delegationExportStatement
    | namespaceExportStatement
    | namedExportPathFull
    | importStatement;
